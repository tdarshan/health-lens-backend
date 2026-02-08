// Standardized response handler
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({
        statusCode,
        success: true,
        message,
        data
    });
};

const sendError = (res, message = 'Error', statusCode = 500, error = null) => {
    const response = {
        statusCode,
        success: false,
        message
    };
    if (process.env.NODE_ENV === 'development' && error) {
        response.error = error;
    }
    res.status(statusCode).json(response);
};

module.exports = {
    sendSuccess,
    sendError
};
