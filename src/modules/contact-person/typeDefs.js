const { gql } = require("apollo-server");

const typeDefs = gql`
    extend type Query {
        "Get list of contact persons under a category"
        GetContactPersons("Category id" category: ID!): ContactPersonsResponse!
        "Get a single contact person"
        GetContactPerson("contact person id" id: ID!): ContactPersonResponse!
        "Get contact persons grouped by category"
        GetContactPersonGroupedBy: ContactPersonGroupResponse!
    }
    extend type Mutation {
        "New Contact person"
        CreateContactPerson(model: ContactPersonInput!): ContactPersonResponse!
        "Update a single contact person account"
        UpdateContactPerson(id: ID!, update: ContactPersonInput!): ContactPersonResponse!
        "Delete a single contact person"
        RemoveContactPerson(id: ID!): DeletedResponse!
    }

    input ContactPersonInput {
        name: String!
        "email address"
        email: String!
        "phone number"
        phone: String!
        image: String!
        "Position in company"
        position: String!
        "Category id"
        category: ID!
    }

    "Contact person template"
    type ContactPerson {
        "Contact person id"
        id: ID!
        "Contact person name"
        name: String!
        "email address"
        email: String!
        "phone number"
        phone: String!
        "Mobile number"
        image: String!
        "Position in company"
        position: String!
        "Category"
        category: Category!
        "Date of creation"
        created_at: String!
    }

    type ContactPersonGroupResponse {
        status: Int!
        message: String!
        docs: [ContactPersonGroup!]
    }

    type ContactPersonGroup {
        category: Category!
        total: Int!
        contacts: [ContactPerson!]
    }
    type ContactPersonsResponse {
        status: Int!
        message: String!
        docs: [ContactPerson!]
    }
    type ContactPersonResponse {
        status: Int!
        message: String!
        doc: ContactPerson!
    }
`;

exports.typeDefs = typeDefs;
