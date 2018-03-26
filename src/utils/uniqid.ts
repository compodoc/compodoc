const uuid = require('uuid/v4');

export function uniqid() {
    return uuid();
}