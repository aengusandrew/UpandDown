export default class ID {
    constructor(length) {
        this.ID = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for(let i = 0; i < length; i++) this.ID += chars.charAt(Math.floor(Math.random() * chars.length));
    }
}