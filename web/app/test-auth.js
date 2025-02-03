// test-auth.js
import { signUp, signIn } from './auth.js';

async function testSignUp() {
    try {
        const newUser = await signUp('testuser', 'Test@1234', [
            { Name: 'email', Value: 'testuser@example.com' }
        ]);
        console.log('Sign Up Success:', newUser);
    } catch (error) {
        console.error('Sign Up Error:', error);
    }
}

async function testSignIn() {
    try {
        const session = await signIn('tone', 'C1nelson?!');
        console.log('Sign In Success:', session.idToken.jwtToken);
    } catch (error) {
        console.error('Sign In Error:', error);
    }
}

// Run the tests
(async function() {
    //await testSignUp();
    await testSignIn();
})();