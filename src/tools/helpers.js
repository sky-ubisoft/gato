const getTime = () => {
    const [seconds, nanos] = process.hrtime();
    return seconds * 1000 + nanos / 1000000;
};

module.exports = { getTime };