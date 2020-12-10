const GetToken = (event) => {
    if (event) {
        const auth = event.headers.authorization || event.headers.Authorization || "";
        if (auth) {
            const t = auth.split(" ")[1];
            if (t) return t;
        }
    }
    throw new Error("Unauthorized Access!");
};

const response = (status, body) => {
    return {
        statusCode: status,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(body),
    };
};

module.exports = {
    getToken: GetToken,
    getResponse: response,
};
