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
export class Data {
    input = undefined;
    mode = undefined;
    linkedOutput = undefined;
    linkedGroupAction = undefined;
    feedbackOutput = undefined;
    feedbackMode = undefined;
    pulseCounter = undefined;
    actions = [];
    previousPulseCounter = undefined;
    outputs = [];
    rooms = [];
    pulseCounters = [];
    ledMap = {};
    ledGlobals = [];
    timeout = 0;
    shutters = [];
    linkedShutter = undefined;
    movement = undefined;
    notInUse = undefined;
    room = undefined;
    save = async () => {};
}
