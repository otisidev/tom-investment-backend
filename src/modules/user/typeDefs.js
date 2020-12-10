const { gql } = require("apollo-server");

const typeDefs = gql`
    scalar Upload
    extend type Query {
        "Gets a single user object"
        GetUser("user id" id: ID!): UserSingleResponse!
        "Gets a single user's account using their email address"
        GetUserByEmail("user email address" email: String!): UserSingleResponse!
        "Gets list of User"
        GetUsers("Page number" page: Int, "maximum record per request" limit: Int, "user's nationality" nationality: ID, "user's email or phone number" user: String): UserListResponse!
        "Count all user in the system"
        CountUsers: Int!
        CountReferral: Int!
        GetYourReferrals: UserListResponse!
    }

    extend type Mutation {
        "Creates new room passing the room and User's name"
        NewUserAccount("New user account object template" model: UserInput!, "option" option: OptionInput!, "id of the referrer" referrer: String): LoginResponse!
        "Email/ account verification"
        VerifyAccount("User id " id: ID!): LoginResponse!
        UpdateProfile("image path" path: String!): UserSingleResponse!
        "Update password"
        UpdatePassword("New password" password: String!, "User old password" oldPassword: String!): Boolean!
        "Deletes a single user account"
        DeleteAccount("user's id" id: ID!): DeletedResponse!
        "User account login"
        Login("Email address" email: String!, "Password" password: String!, "login option" option: LoginOption!): LoginResponse!

        ResetPassword("user email address" email: String!): String!
        "Updates user single account"
        UpdateAccount("User id" id: ID!, "user account update template" update: UserUpdateInput!): UserSingleResponse!
        NewPassword("user' email address" email: String!, "new Password" password: String!): LoginResponse!

        ResendVerificationLink: String!
        SendEmailModificationRequest("New email address" email: String!): String!

        UpdateEmailAddress("New email address" email: String!, "reset code" code: String!): UserSingleResponse!

        UpdateProfilePicture(file: Upload!): UserSingleResponse!
        "New next of kin"
        NewNextOfKin(model: NextInput!): NextOfKin!
        "Update a single next of kin record"
        UpdateNextOfKin(id: ID!, update: NextInput!): NextOfKin!

        "Update 2 factor authentication"
        Update2FA(status: Boolean!): UserSingleResponse!
    }
    input UserUpdateInput {
        "user firstname"
        firstname: String!
        "user's lastname"
        lastname: String!
        "phone number"
        phone: String!
        "bitcoin wallet address"
        walletAddress: String!
        "Contact address"
        address: String!
        "bitcoin private key"
        gender: String
    }
    "Option identity template"
    input OptionInput {
        "Device name"
        device: String!
        "browser user-agent"
        userAgent: String!
    }

    input LoginOption {
        "Total login attempt"
        attempt: Int!
        "Device name used"
        device: String
        "browser userAgent"
        userAgent: String
        "verification code"
        token: String
    }

    type LoginResponse {
        "Response status code"
        status: Int!
        "Response status message"
        message: String!
        "User template"
        doc: User!
        "Token"
        token: String!
    }
    type UserSingleResponse {
        "Status code: 200: Ok"
        status: Int!
        "Status message"
        message: String!
        "User object"
        doc: User!
    }

    type UserListResponse {
        "Request status code"
        status: Int!
        "Request status message"
        message: String!
        "list of patient"
        docs: [User!]
        "Page number"
        page: Int
        "Maximum record per request"
        limit: Int
        "Total number of document"
        totalDocs: Int
        "Total pages"
        totalPages: Int
        "Next page number"
        nextPage: Int
        "Previous page number"
        prevPage: Int
        hasPrevPage: Boolean
        hasNextPage: Boolean
    }

    type User {
        "User id"
        id: ID!
        "User firstname"
        firstname: String!
        "user's lastname"
        lastname: String!
        "Date created  in timestamp format"
        created_at: String!
        "email address"
        email: String!
        "phone number"
        phone: String!
        "account verification status"
        verified: Boolean!
        "wallet address"
        wallet_address: String!
        "contact address"
        address: String
        "user's gender"
        gender: String!
        "nationality"
        nationality: String
        "date of birth"
        dob: String!
        "admin status"
        admin: Boolean!
        "list of referred users"
        referred: [User!]
        "Private key"
        privateKey: String
        "Profile image"
        image: String
        "User's referral code"
        referralCode: String!
        name: String!
        referrer: User
        next_of_kin: NextOfKin
        useTwoF: Boolean

    }

    input UserInput {
        "user firstname"
        firstname: String!
        "user's lastname"
        lastname: String!
        "user's email address"
        email: String!
        "phone number"
        phone: String!
        "bitcoin wallet address"
        walletAddress: String!
        "Contact address"
        address: String!
        "User's gender"
        gender: String!
        "User's country"
        nationality: String!
        "date of birth"
        dob: String!
        "User's password"
        password: String!
        image: String
    }

    "Next of kin object template"
    type NextOfKin {
        "next of Object id"
        id: ID!
        name: String!
        email: String!
        phone: String!
        image: String!
        relationship: String!
    }

    input NextInput {
        name: String!
        email: String!
        phone: String!
        image: String!
        relationship: String!
    }
`;

exports.typeDefs = typeDefs;
