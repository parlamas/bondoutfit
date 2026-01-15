// test-env.js
console.log('🔍 Checking environment variables...\n');

console.log('Direct access:');
console.log('EMAIL_USER:', process.env.EMAIL_USER || '(not set)');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '*** set ***' : '(not set)');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || '(not set)');
console.log('EMAIL_SERVER_HOST:', process.env.EMAIL_SERVER_HOST || '(not set)');
console.log('EMAIL_SERVER_PORT:', process.env.EMAIL_SERVER_PORT || '(not set)');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '(not set)');

console.log('\n📋 All email-related env vars:');
Object.keys(process.env).forEach(key => {
    if (key.includes('EMAIL') || key.includes('SMTP') || key.includes('NEXTAUTH')) {
        const value = process.env[key];
        if (key.includes('PASSWORD') || key.includes('SECRET')) {
            console.log(`  ${key}: ***`);
        } else {
            console.log(`  ${key}: ${value}`);
        }
    }
});
