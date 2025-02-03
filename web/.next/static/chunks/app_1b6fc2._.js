(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/app_1b6fc2._.js", {

"[project]/app/auth.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "getIdToken": (()=>getIdToken),
    "isSignedIn": (()=>isSignedIn),
    "signIn": (()=>signIn),
    "signOut": (()=>signOut)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$amazon$2d$cognito$2d$identity$2d$js$2f$es$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/amazon-cognito-identity-js/es/index.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jwt$2d$decode$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/jwt-decode/build/esm/index.js [app-client] (ecmascript)"); // You'll need to install jwt-decode package
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$amazon$2d$cognito$2d$identity$2d$js$2f$es$2f$CognitoUserPool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CognitoUserPool$3e$__ = __turbopack_import__("[project]/node_modules/amazon-cognito-identity-js/es/CognitoUserPool.js [app-client] (ecmascript) <export default as CognitoUserPool>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$amazon$2d$cognito$2d$identity$2d$js$2f$es$2f$AuthenticationDetails$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AuthenticationDetails$3e$__ = __turbopack_import__("[project]/node_modules/amazon-cognito-identity-js/es/AuthenticationDetails.js [app-client] (ecmascript) <export default as AuthenticationDetails>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$amazon$2d$cognito$2d$identity$2d$js$2f$es$2f$CognitoUser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CognitoUser$3e$__ = __turbopack_import__("[project]/node_modules/amazon-cognito-identity-js/es/CognitoUser.js [app-client] (ecmascript) <export default as CognitoUser>");
;
;
const poolData = {
    UserPoolId: 'eu-west-2_Qv91VSnrS',
    ClientId: '533mf4s6jof94htjam2dut05hd'
};
const userPool = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$amazon$2d$cognito$2d$identity$2d$js$2f$es$2f$CognitoUserPool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CognitoUserPool$3e$__["CognitoUserPool"](poolData);
function signIn(username, password) {
    const authenticationDetails = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$amazon$2d$cognito$2d$identity$2d$js$2f$es$2f$AuthenticationDetails$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AuthenticationDetails$3e$__["AuthenticationDetails"]({
        Username: username,
        Password: password
    });
    const userData = {
        Username: username,
        Pool: userPool
    };
    const cognitoUser = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$amazon$2d$cognito$2d$identity$2d$js$2f$es$2f$CognitoUser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CognitoUser$3e$__["CognitoUser"](userData);
    return new Promise((resolve, reject)=>{
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result)=>{
                const idToken = result.getIdToken().getJwtToken();
                sessionStorage.setItem('idToken', idToken);
                resolve(result);
            },
            onFailure: (err)=>reject(err)
        });
    });
}
function signOut() {
    sessionStorage.removeItem('idToken');
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
        currentUser.signOut();
    }
}
function isSignedIn() {
    const idToken = sessionStorage.getItem('idToken');
    if (!idToken) {
        return false;
    }
    try {
        const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jwt$2d$decode$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jwtDecode"])(idToken);
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp > currentTime;
    } catch (error) {
        console.error('Invalid token', error);
        return false;
    }
}
function getIdToken() {
    return sessionStorage.getItem('idToken');
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/client.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
// client.js
__turbopack_esm__({
    "apiRequest": (()=>apiRequest)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$auth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/app/auth.js [app-client] (ecmascript)");
;
async function apiRequest(endpoint, options = {}) {
    const headers = {
        ...options.headers,
        Authorization: `Bearer ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$auth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getIdToken"])()}`,
        'Content-Type': 'application/json'
    };
    const response = await fetch(endpoint, {
        ...options,
        headers
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/layout.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>DashboardLayout)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$auth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/app/auth.js [app-client] (ecmascript)"); // Assuming signIn function is shared
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/app/client.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
var _s = __turbopack_refresh__.signature();
"use client";
;
;
;
;
function DashboardLayout({ children }) {
    _s();
    const [isLoggedIn, setIsLoggedIn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [errorMessage, setErrorMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [username, setUsername] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const menuItems = [
        {
            name: 'Home',
            path: '/'
        },
        {
            name: 'Boards',
            path: '/boards'
        },
        {
            name: 'Tasks',
            path: '/tasks'
        }
    ];
    async function handleLogin(event) {
        event.preventDefault();
        const form = event.currentTarget;
        try {
            const username = form.elements.email.value;
            const password = form.elements.password.value;
            // Sign in with AWS Cognito
            const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$auth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signIn"])(username, password);
            console.log("User signed in:", user);
            console.log("ID token:", user.idToken.jwtToken);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setIdToken"])(user.idToken.jwtToken); // Set the ID token for the client
            setIsLoggedIn(true);
            setUsername(username); // Set the username after successful login
            setErrorMessage(''); // Clear errors on success
        } catch (error) {
            console.error("Error signing in:", error);
            setErrorMessage("Sign in failed. Please check your credentials."); // Show error message
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("html", {
        lang: "en",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("body", {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '10px',
                        borderBottom: '1px solid #ccc'
                    },
                    children: isLoggedIn ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            "Welcome, ",
                            username,
                            "!"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/layout.js",
                        lineNumber: 46,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        onSubmit: handleLogin,
                        style: {
                            display: 'flex',
                            alignItems: 'center'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "email",
                                children: "Email:"
                            }, void 0, false, {
                                fileName: "[project]/app/layout.js",
                                lineNumber: 49,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                id: "email",
                                name: "email"
                            }, void 0, false, {
                                fileName: "[project]/app/layout.js",
                                lineNumber: 50,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "password",
                                children: "Password:"
                            }, void 0, false, {
                                fileName: "[project]/app/layout.js",
                                lineNumber: 51,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "password",
                                id: "password",
                                name: "password"
                            }, void 0, false, {
                                fileName: "[project]/app/layout.js",
                                lineNumber: 52,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "submit",
                                value: "Login"
                            }, void 0, false, {
                                fileName: "[project]/app/layout.js",
                                lineNumber: 53,
                                columnNumber: 15
                            }, this),
                            errorMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: 'red',
                                    marginLeft: '10px'
                                },
                                children: errorMessage
                            }, void 0, false, {
                                fileName: "[project]/app/layout.js",
                                lineNumber: 54,
                                columnNumber: 32
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/layout.js",
                        lineNumber: 48,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/layout.js",
                    lineNumber: 44,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                    children: isLoggedIn ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex h-screen",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-1/4 bg-gray-800 text-white p-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-xl font-bold mb-4",
                                        children: "Menu"
                                    }, void 0, false, {
                                        fileName: "[project]/app/layout.js",
                                        lineNumber: 62,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        children: menuItems.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                className: "mb-2",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    href: item.path,
                                                    className: "block p-2 rounded hover:bg-gray-700",
                                                    children: item.name
                                                }, void 0, false, {
                                                    fileName: "[project]/app/layout.js",
                                                    lineNumber: 66,
                                                    columnNumber: 23
                                                }, this)
                                            }, item.path, false, {
                                                fileName: "[project]/app/layout.js",
                                                lineNumber: 65,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/layout.js",
                                        lineNumber: 63,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/layout.js",
                                lineNumber: 61,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-3/4 p-6 overflow-y-auto",
                                children: children
                            }, void 0, false, {
                                fileName: "[project]/app/layout.js",
                                lineNumber: 73,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/layout.js",
                        lineNumber: 60,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Please log in to access application features."
                    }, void 0, false, {
                        fileName: "[project]/app/layout.js",
                        lineNumber: 78,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/layout.js",
                    lineNumber: 58,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/layout.js",
            lineNumber: 43,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/layout.js",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
_s(DashboardLayout, "w+ZRbw2yN312NQ1+KdG840Vfswg=");
_c = DashboardLayout;
var _c;
__turbopack_refresh__.register(_c, "DashboardLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/layout.js [app-rsc] (ecmascript, Next.js server component, client modules)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
}}),
}]);

//# sourceMappingURL=app_1b6fc2._.js.map