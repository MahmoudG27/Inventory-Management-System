export const msalConfig = {
    auth: {
        clientId: "75616255-4c95-452e-8022-b8454ed39b6c",
        authority: "https://login.microsoftonline.com/common", // Personal Microsoft accounts
        // authority: "https://login.microsoftonline.com/e12a260c-947a-40e3-a826-aa800e3bcc10", when use Single tenant only - ******
        redirectUri: window.location.origin
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false
    }
};

export const loginRequest = {
    scopes: ["User.Read"]
};