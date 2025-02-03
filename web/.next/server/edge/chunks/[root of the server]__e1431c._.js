(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["chunks/[root of the server]__e1431c._.js", {

"[externals]/node:async_hooks [external] (node:async_hooks, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}}),
"[externals]/node:buffer [external] (node:buffer, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:buffer", () => require("node:buffer"));

module.exports = mod;
}}),
"[project]/app/auth.js [middleware] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "getIdToken": (()=>getIdToken),
    "getUsername": (()=>getUsername),
    "isSignedIn": (()=>isSignedIn),
    "signIn": (()=>signIn),
    "signOut": (()=>signOut)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$amazon$2d$cognito$2d$identity$2d$js$2f$es$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/amazon-cognito-identity-js/es/index.js [middleware] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jwt$2d$decode$2f$build$2f$esm$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/jwt-decode/build/esm/index.js [middleware] (ecmascript)"); // You'll need to install jwt-decode package
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$amazon$2d$cognito$2d$identity$2d$js$2f$es$2f$CognitoUserPool$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__$3c$export__default__as__CognitoUserPool$3e$__ = __turbopack_import__("[project]/node_modules/amazon-cognito-identity-js/es/CognitoUserPool.js [middleware] (ecmascript) <export default as CognitoUserPool>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$amazon$2d$cognito$2d$identity$2d$js$2f$es$2f$AuthenticationDetails$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__$3c$export__default__as__AuthenticationDetails$3e$__ = __turbopack_import__("[project]/node_modules/amazon-cognito-identity-js/es/AuthenticationDetails.js [middleware] (ecmascript) <export default as AuthenticationDetails>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$amazon$2d$cognito$2d$identity$2d$js$2f$es$2f$CognitoUser$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__$3c$export__default__as__CognitoUser$3e$__ = __turbopack_import__("[project]/node_modules/amazon-cognito-identity-js/es/CognitoUser.js [middleware] (ecmascript) <export default as CognitoUser>");
;
;
const poolData = {
    UserPoolId: 'eu-west-2_Qv91VSnrS',
    ClientId: '533mf4s6jof94htjam2dut05hd'
};
const userPool = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$amazon$2d$cognito$2d$identity$2d$js$2f$es$2f$CognitoUserPool$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__$3c$export__default__as__CognitoUserPool$3e$__["CognitoUserPool"](poolData);
function signIn(username, password) {
    const authenticationDetails = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$amazon$2d$cognito$2d$identity$2d$js$2f$es$2f$AuthenticationDetails$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__$3c$export__default__as__AuthenticationDetails$3e$__["AuthenticationDetails"]({
        Username: username,
        Password: password
    });
    const userData = {
        Username: username,
        Pool: userPool
    };
    const cognitoUser = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$amazon$2d$cognito$2d$identity$2d$js$2f$es$2f$CognitoUser$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__$3c$export__default__as__CognitoUser$3e$__["CognitoUser"](userData);
    return new Promise((resolve, reject)=>{
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result)=>{
                const idToken = result.getIdToken().getJwtToken();
                sessionStorage.setItem('idToken', idToken);
                sessionStorage.setItem('name', username);
                resolve(result);
            },
            onFailure: (err)=>reject(err)
        });
    });
}
function signOut() {
    sessionStorage.removeItem('idToken');
    sessionStorage.removeItem('name');
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
        const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jwt$2d$decode$2f$build$2f$esm$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["jwtDecode"])(idToken);
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
function getUsername() {
    return sessionStorage.getItem('name');
}
}}),
"[project]/middleware.js [middleware] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "config": (()=>config),
    "middleware": (()=>middleware)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/next/dist/esm/api/server.js [middleware] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$auth$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/app/auth.js [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware] (ecmascript)");
;
;
function middleware(request) {
    console.log("Middleware");
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$auth$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["isSignedIn"])()) {
        console.log("Not signed in");
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/login', request.url));
    }
    console.log("Signed in");
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        '/((?!login).*)'
    ]
};
}}),
}]);

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__e1431c._.js.map