import { ObjectId } from "mongodb";

export interface Characters {
    id:             string;
    name:           string;
    description:    string;
    age:            number;
    available:      boolean;
    birthdate:      string;
    country:        string;
    profilePicture: string;
    avatar:         string;
    abilities:      string[];
    role:           string;
    roleSymbol:     string;
    teams:          Teams;
}

export interface Teams {
    id:      string;
    name:    string;
    logo:    string;
    founded: number;
    motto: string;
    country: string;
    captain: string;
}

export interface User {
    _id?: ObjectId;
    username: string;
    password: string;
    role: "ADMIN" | "USER";
}
