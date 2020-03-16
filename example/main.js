const cypress = require('cypress');
const RPClient = require('reportportal-client');
const fs = require('fs');
const glob = require('glob');

const cypressConfigFile = 'cypress.json';

const getLaunchTempFiles = () => {
  return glob.sync('rplaunch-*.tmp');
};

const deleteTempFile = (filename) => {
  fs.unlinkSync(filename);
};

// Clean any existing temp files
console.log("Cleaning temp files");
const files = getLaunchTempFiles();
files.map(deleteTempFile);

cypress.run().then(
  () => {
    fs.readFile(cypressConfigFile, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }

      const config = JSON.parse(data);

      if (config.reporterOptions.isLaunchMergeRequired) {
        const client = new RPClient(config.reporterOptions);
                    
        client.mergeLaunches().then(merged => {

            const files = getLaunchTempFiles();
            files.map(deleteTempFile);

            // Exit the process
            console.log("All done. Exiting.");
            process.exit();
        });
      }
    });
    setTimeout(() => {console.log("Process timedout. Exiting.");process.exit(1);}, 60000);
  },
  (error) => {
    console.error(error);
    const files = getLaunchTempFiles();
    files.map(deleteTempFile);
    process.exit(1);
  },
);
