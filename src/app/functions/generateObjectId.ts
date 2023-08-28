export function generateObjectId() {
    const timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    const randomPart = Math.floor(Math.random() * 16777215).toString(16);
    const increment = Math.floor(Math.random() * 16777215).toString(16);

    return timestamp + randomPart + increment;
}