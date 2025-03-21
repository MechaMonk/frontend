/*
 * Copyright (C) 2016 OpenMotics BV
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import {inject, Factory, computedFrom} from 'aurelia-framework';
import {DialogService} from 'aurelia-dialog';
import {Base} from 'resources/base';
import {Refresher} from 'components/refresher';
import {Toolbox} from 'components/toolbox';
import {Logger} from 'components/logger';
import {Output} from 'containers/output';
import {Shutter} from 'containers/shutter';
import {Input} from 'containers/input';
import {Room} from 'containers/room';
import {EventsWebSocketClient} from 'components/websocket-events';
import {upperFirstLetter} from 'resources/generic';

@inject(DialogService, Factory.of(Input), Factory.of(Output), Factory.of(Shutter), Factory.of(Room))
export class Inputs extends Base {
    constructor(dialogService, inputFactory, outputFactory, shutterFactory, roomFactory,...rest) {
        super(...rest);
        this.dialogService = dialogService;
        this.inputFactory = inputFactory;
        this.outputFactory = outputFactory;
        this.shutterFactory = shutterFactory;
        this.roomFactory = roomFactory;
        this.type = '';
        this.webSocket = new EventsWebSocketClient(['OUTPUT_CHANGE', 'SHUTTER_CHANGE']);
        this.webSocket.onMessage = async (message) => {
            return this.processEvent(message);
        };
        this.configurationRefresher = new Refresher(() => {
            if (this.installationHasUpdated) {
                this.initVariables();
            }
            this.loadOutputsConfiguration().then(() => {
                this.signaler.signal('reload-outputs');
                this.signaler.signal('reload-outputs-shutters');
            });
            this.loadShuttersConfiguration().then(() => {
                this.signaler.signal('reload-shutters');
                this.signaler.signal('reload-outputs-shutters');
            });
        }, 30000);
        this.refresher = new Refresher(() => {
            if (this.installationHasUpdated) {
                this.initVariables();
            }
            if (!this.webSocket.isAlive(30)) {
                this.loadOutputs().then(() => {
                    this.signaler.signal('reload-outputs');
                    this.signaler.signal('reload-outputs-shutters');
                });
                this.loadShutters().then(() => {
                    this.signaler.signal('reload-shutters');
                    this.signaler.signal('reload-outputs-shutters');
                });
            }
            this.loadInputs().catch(() => {});
            this.loadRooms().catch(() => {});
        }, 5000);
        this.Output = Output;
        this.Shutter = Shutter;
        this.initVariables();
    }

    initVariables() {
        this.outputs = [];
        this.outputMap = {};
        this.outputsLoading = true;
        this.activeOutput = undefined;
        this.outputUpdating = false;
        this.shutters = [];
        this.shutterMap = {};
        this.shuttersLoading = true;
        this.inputs = [];
        this.inputsMap = {};
        this.inputsLoading = true;
        this.rooms = [];
        this.roomsMap = {};
        this.roomsLoading = true;
        this.filters = ['unconfigured', 'notinuse', 'light', 'valve', 'outlet', 'alarm', 'generic', 'pump', 'appliance', 'hvac', 'motor', 'ventilation', 'heater', 'dimmer', 'relay', 'virtual', 'shutter'];
        this.filter = ['unconfigured', 'light', 'valve', 'outlet', 'alarm', 'generic', 'pump', 'appliance', 'hvac', 'motor', 'ventilation', 'heater', 'dimmer', 'relay', 'virtual', 'shutter'];
        this.installationHasUpdated = false;
    }

    @computedFrom('outputs', 'filter', 'activeOutput')
    get filteredOutputs() {
        let outputs = [];
        outputs = this.outputs.filter(output => {
            if ((this.filter.contains('dimmer') && output.isDimmer) ||
                this.filter.contains('unconfigured') && output.name.toLowerCase() === this.i18n.tr('generic.noname').toLowerCase() ||
                this.filter.contains('relay') && !output.isLight ||
                (this.filter.contains('virtual') && output.isVirtual) ||
                (this.filter.contains('notinuse') && !output.inUse)) {
                    return true;
                }
            return this.filter.includes(output.outputType);
        });
        if (this.activeOutput instanceof Output && !outputs.contains(this.activeOutput)) {
            this.activeOutput = undefined;
        }
        return outputs;
    }

    @computedFrom('shutters', 'filter', 'activeOutput')
    get filteredShutters() {
        let shutters = [];
        for (let shutter of this.shutters) {
            if (this.filter.contains('shutter') ||
                this.filter.contains('unconfigured') && shutter.name.toLowerCase() === this.i18n.tr('generic.noname').toLowerCase() ||
                (this.filter.contains('notinuse') && !shutter.inUse)) {
                shutters.push(shutter);
            }
        }
        if (this.activeOutput instanceof Shutter && !shutters.contains(this.activeOutput)) {
            this.activeOutput = undefined;
        }
        return shutters;
    }

    filterText(filter) {
        return this.i18n.tr(`pages.setup.outputs.filter.${filter}`);
    }

    filterUpdated() {
        this.signaler.signal('reload-outputs');
        this.signaler.signal('reload-shutters');
        this.signaler.signal('reload-outputs-shutters');
    }

    selectAll() {
        this.filter = this.filters;
        this.filterUpdated();
    }

    selectNone() {
        this.filter = [];
        this.filterUpdated();
    }

    async processEvent(event) {
        switch (event.type) {
            case 'OUTPUT_CHANGE': {
                let output = this.outputMap[event.data.id];
                if (output !== undefined) {
                    output.status = event.data.status.on ? 1 : 0;
                    output.dimmer = event.data.status.value;
                }
                break;
            }
            case 'SHUTTER_CHANGE': {
                let shutter = this.shutterMap[event.data.id];
                if (shutter !== undefined) {
                    shutter.status = event.data.status.state.toLowerCase();
                }
                break;
            }
        }
    }

    async loadRooms() {
        try {
            let rooms = await this.api.getRooms();
            Toolbox.crossfiller(rooms.data, this.rooms, 'id', (id) => {
                let room = this.roomFactory(id);
                this.roomsMap[id] = room;
                return room;
            });
            this.roomsLoading = false;
        } catch (error) {
            Logger.error(`Could not load Rooms: ${error.message}`);
        }
    }

    async loadOutputsConfiguration() {
        try {
            let configurationData = await this.api.getOutputConfigurations();
            Toolbox.crossfiller(configurationData.config, this.outputs, 'id', (id) => {
                let output = this.outputFactory(id);
                this.outputMap[id] = output;
                return output;
            });
            this.outputs.sort((a, b) => {
                return a.id > b.id ? 1 : -1;
            });
            this.outputsLoading = false;
        } catch (error) {
            Logger.error(`Could not load Ouptut configurations: ${error.message}`);
        }
    }

    async loadOutputs() {
        try {
            let statusData = await this.api.getOutputStatus();
            Toolbox.crossfiller(statusData.status, this.outputs, 'id', () => {
                return undefined;
            });
            this.outputsLoading = false;
        } catch (error) {
            Logger.error(`Could not load Ouptut statusses: ${error.message}`);
        }
    }

    async loadShuttersConfiguration() {
        try {
            let configurationData = await this.api.getShutterConfigurations();
            Toolbox.crossfiller(configurationData.config, this.shutters, 'id', (id) => {
                let shutter = this.shutterFactory(id);
                this.shutterMap[id] = shutter;
                return shutter;
            });
            this.shutters.sort((a, b) => {
                return a.id > b.id ? 1 : -1;
            });
            this.shuttersLoading = false;
        } catch (error) {
            Logger.error(`Could not load Shutter configurations: ${error.message}`);
        }
    }

    async loadShutters() {
        try {
            let statusData = await this.api.getShutterStatus();
            const { data: shutters } = await this.api.getShutters();
            for (let shutter of this.shutters) {
                const shutterData = shutters.find(({ id }) => id === shutter.id);
                shutter.status = statusData.status[shutter.id];
                if (shutterData) {
                    shutter.locked = shutterData.status.locked;
                }
            }
            this.shuttersLoading = false;
        } catch (error) {
            Logger.error(`Could not load Shutter statusses: ${error.message}`);
        }
    }

    async loadInputs() {
        try {
            let data = await this.api.getInputConfigurations();
            Toolbox.crossfiller(data.config, this.inputs, 'id', (id) => {
                let input = this.inputFactory(id);
                this.inputsMap[id] = input;
                return input;
            });
            this.inputsLoading = false;
        } catch (error) {
            Logger.error(`Could not load Input configurations: ${error.message}`);
        }
    }

    selectOutput(type, id) {
        let foundOutput = undefined;
        this.type = type;
        if (type === 'output') {
            for (let output of this.outputs) {
                if (output.id === id) {
                    foundOutput = output;
                }
            }
        } else if (type === 'shutter') {
            for (let shutter of this.shutters) {
                if (shutter.id === id) {
                    foundOutput = shutter;
                }
            }
        }
        this.activeOutput = foundOutput;
    }

    async save() {
        this.outputUpdating = true
        if (this.activeOutput instanceof Output) {
            await this.configureOutputViewModel.beforeSave();
        } else {
            await this.configureShutterViewModel.beforeSave();
        }
        this.outputUpdating = false;
    }
    
    toLowerText = (text) => upperFirstLetter(this.i18n.tr(text))

    installationUpdated() {
        this.installationHasUpdated = true;
        this.refresher.run();
        this.configurationRefresher.run();
    }

    // Aurelia
    attached() {
        super.attached();
    }

    activate() {
        this.refresher.run();
        this.refresher.start();
        this.configurationRefresher.run();
        this.configurationRefresher.start();
        try {
            this.webSocket.connect();
        } catch (error) {
            Logger.error(`Could not start websocket for realtime data: ${error}`);
        }
    }

    deactivate() {
        this.refresher.stop();
        this.configurationRefresher.stop();
        this.webSocket.close();
    }
}
