const { connect } = require("../context");
const { ApolloServer } = require("apollo-server-lambda");
const { helpers, loaders } = require("./service/root.service");
const { verify } = require("jsonwebtoken");

// instance of Apollo server
const server = new ApolloServer({
    introspection: true,
    dataSources: () => ({
        helpers,
        loaders
    }),
    context: async ({ event }) => {
        let cb = {
            userAgent: event.headers["user-agent"],
            ip: ""
        };
        const auth = event.headers.Authorization || event.headers.authorization || "";
        if (auth) {
            const token = auth.split(" ")[1];
            // check if token is null or empty
            if (token) {
                // try to verify the token
                try {
                    const user = verify(token, process.env.DB_KEY);
                    if (user) cb.user = user;
                } catch (error) {
                    console.log(error);
                }
            }
        }
        return cb;
    },
    modules: [
        require("./modules/plan"),
        require("./modules/user"),
        require("./modules/investment"),
        require("./modules/referral"),
        require("./modules/wallet"),
        require("./modules/category"),
        require("./modules/contact-person"),
        require("./modules/currency"),
        require("./modules/top-up")
    ],
    cors: {
        origin: "*",
        allowedHeaders: "*",
        methods: "*"
    }
});

// connect to database
connect()
    .then(
        () => {}
        // (status) =>
        //     status &&
        //     server
        //         .listen(4400)
        //         .then(({ url }) => console.log(` Application running @ ${url}`))
        //         .catch((err) => {
        //             console.error(JSON.stringify(err, null, 5));
        //             process.exit(1);
        // )
    )
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });

module.exports.handler = server.createHandler({
    cors: {
        origin: "*",
        allowedHeaders: "*",
        methods: "*"
    }
});
