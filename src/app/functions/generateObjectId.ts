export function generateObjectId() {
    const { v4: uuidv4 } = require('uuid');

    const uuid = uuidv4();
     return uuid; // This will print a generated UUID

}