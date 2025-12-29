import { setup } from '../src/setup/auth';

setup()
    .then(() => {
        console.log('\n✨ Auth setup completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Auth setup failed:', error);
        process.exit(1);
    });

