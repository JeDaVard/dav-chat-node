const generateMessage = (text, username) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
};
const generateLocMessage = (url, username) => {
    return {
        username,
        url,
        createdAt: new Date().getTime
    }
};

module.exports = {
    generateMessage,
    generateLocMessage
};