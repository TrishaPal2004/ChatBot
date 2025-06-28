export const generateId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 9);
    return `${timestamp}_${randomStr}`;
};
