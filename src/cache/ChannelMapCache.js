'use strict';
let BaseCache = require('./BaseCache');

class ChannelMapCache extends BaseCache {
    constructor(storageEngine, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = 'channelmap';
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }

    async get (id, type = 'guild') {
        if (this.boundObject) {
            return this.boundObject;
        }
        let channelMap = await this.storageEngine.get(this.buildId(this._buildMapId(id, type)));
        if (channelMap) {
            return new ChannelMapCache(this.storageEngine, channelMap);
        } else {
            return null;
        }
    }

    async update(id, data, type = 'guild') {
        if (this.boundObject) {
            data = this._buildMap(id, data, type);
            this.bindObject(data); //using bindobject() to assure the data of the class is valid
            await this.update(this.boundObject.id, data);
            return this;
        }
        let channelMap = this._buildMap(id, data, type);
        await this.storageEngine.upsert(this.buildId(this._buildMapId(id, type)), channelMap);
        channelMap = await this.storageEngine.get(this.buildId(this._buildMapId(id, type)));
        return new ChannelMapCache(this.storageEngine, channelMap);
    }

    async remove(id, type = 'guild') {
        if (this.boundObject) {
            return this.storageEngine.remove(this.boundObject.id);
        }
        let channelMap = await this.storageEngine.get(this.buildId(this._buildMapId(id, type)));
        if (channelMap) {
            return this.storageEngine.remove(channelMap.id);
        } else {
            return null;
        }
    }

    _buildMapId(id, type) {
        return `${type}.${id}`;
    }

    _buildMap(id, data, type) {
        return {id: this._buildMapId(id, type), channels: data, type};
    }
}

module.exports = ChannelMapCache;
