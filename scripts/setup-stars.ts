import { setup } from '../src/setup/star';

setup()
    .then(() => {
        console.log('\n✨ Stars setup completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Stars setup failed:', error);
        process.exit(1);
    });

