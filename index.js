#!/usr/bin/env node
let shell = require('shelljs')
let colors = require('colors')
var readlineSync = require('readline-sync');
var inquirer = require('inquirer');
var prompt = inquirer.createPromptModule();

let fs = require('fs')
let templates = require('./templates/templates.js')
let templateTypescript = require('./template-typescript/templates.js')

let appName = process.argv[2]
let appDirectory = `${process.cwd()}/${appName}`
let selectedTemplate;

const dependeciesRequired = {
  'react-materialize': {
    value: null,
    dependency: ['react-materialize'],
    dependencyType: '--save'
  },
  'eslint': {
    value: null,
    dependency: ['eslint', 'eslint-plugin-react@latest', 'eslint-config-airbnb', 'eslint-plugin-import', 'eslint-plugin-jsx-a11y', 'eslint-plugin-react', 'prettier', 'lint-staged'],
    dependencyType: '--save-dev'
  },
  'husky': {
    value: null,
    dependency: ['husky '],
    dependencyType: '--save-dev'
  },
  'styled-components': {
    value: null,
    dependency: ['styled-components'],
    dependencyType: '--save'
  }
}
let installablePackages = [[],[]];

const run = async () => {
 await inquirer
  .prompt([
    {
      type: 'list',
      name: 'reptile',
      message: 'Create React App with JavaScript or Typescript?',
      choices: ['With JavaScript', 'With Typescript'],
    },
  ])
  .then(async (answers) => {
    if(answers.reptile === "With JavaScript") {
      await takeUserInput()
      await createReactApp()
    }else if(answers.reptile === "With Typescript") {
      await takeUserInput()
      await createTypescriptReactApp()
      selectedTemplate = answers.reptile
    }else {
      console.info('Answer:', answers.reptile);
    }
  }).then(async() => {
    await cdIntoNewApp()
    await installPackages()
    await updateTemplates()
  });
  console.log('All done')
}

const takeUserInput = () => {
  return new Promise((resolve, reject) => {
    let promises = [];
    Object.keys(dependeciesRequired).forEach((dependency, i) => {
      promises[i] = new Promise(res => {
        return takeInput(`Would you like to install ${dependency}? yes/no  `, res, dependency)
      });
    });
    Promise.all(promises).then(()=>{resolve()})
  });
}
const takeInput = (msg, res, dependency) => {

  let answer = readlineSync.question(msg, {
    trueValue: ['yes', 'y', 'Yes', 'YES', 'Y', ''],
    falseValue: ['no', 'No', 'NO', 'N', 'n']
  });
  if (answer === true) {
    dependeciesRequired[dependency]['value'] = true;
    res()
  } else if (answer === false) {
    dependeciesRequired[dependency]['value'] = false;
    res()
  } else {
    console.log('Please enter valid input. "' + answer + '" what does it mean?');
    return takeInput(msg, res, dependency);
  }
}

const createTypescriptReactApp = () => {
  return new Promise((resolve) => {
    if (appName) {
      shell.exec(`npx create-react-app ${appName} --template typescript`, (code) => {
        console.log('Exited with code ', code)
        console.log('Created react app')
        resolve(true)
      })
    } else {
      console.log('\nNo app name was provided.'.red)
      console.log('\nProvide an app name in the following format: ')
      console.log('\ncreate-react-redux-router-app ', 'app-name\n'.cyan)
      resolve(false)
    }
  })
}

const createReactApp = () => {
  return new Promise((resolve) => {
    if (appName) {
      shell.exec(`npx create-react-app ${appName}`, (code) => {
        console.log('Exited with code ', code)
        console.log('Created react app')
        resolve(true)
      })
    } else {
      console.log('\nNo app name was provided.'.red)
      console.log('\nProvide an app name in the following format: ')
      console.log('\ncreate-react-redux-router-app ', 'app-name\n'.cyan)
      resolve(false)
    }
  })
}

const cdIntoNewApp = () => {
  return new Promise((resolve) => {
    shell.cd(appDirectory)
    resolve()
  })
}

const installPackages = () => {
  return new Promise(resolve=>{
    Object.keys(dependeciesRequired).forEach((packageName, i) => {
      if(dependeciesRequired[packageName]['value']){
        if(dependeciesRequired[packageName]['dependencyType'].includes('--save-dev')){
          for(let j=0; j<dependeciesRequired[packageName]['dependency'].length; j++){
            installablePackages[0].push(dependeciesRequired[packageName]['dependency'][j])
          }
        } else {
          for(let j=0; j<dependeciesRequired[packageName]['dependency'].length; j++){
            installablePackages[1].push(dependeciesRequired[packageName]['dependency'][j])
          }
        }
      }
    })
    // console.log('installPackages:-- ', installablePackages[1].join(' '), 'for dev ',installablePackages[0].join(' '))
    console.log(`\nInstalling redux, react-router, react-router-dom, react-redux, and redux-thunk ${installablePackages[1].join(' ')}\n`.cyan)
    shell.exec(`npm install --save redux react-router react-router-dom react-redux redux-thunk ${installablePackages[1].join(' ')}`, () => {
      if(installablePackages[0].length){
        shell.exec(`npm install --save-dev ${installablePackages[0].join(' ')}`, () => {
          console.log("\nFinished installing packages installablePackages\n".green)
          resolve()
        })
      } else {
        console.log("\nFinished installing packages\n".green)
        resolve()
      }
    })
  })
}

// const installPackages = () => {
//   return new Promise((resolve) => {
//     console.log(
//       '\nInstalling redux, react-router, react-router-dom, react-redux, and redux-thunk\n'
//         .cyan
//     )
//     shell.exec(
//       `npm install -D redux react-router react-redux redux-thunk react-router-dom`,
//       () => {
//         console.log('\nFinished installing packages\n'.green)
//         resolve()
//       }
//     )
//   })
// }

const updateTemplates = () => {
  return new Promise((resolve) => {
    let promises = []
    Object.keys(selectedTemplate === "With Typescript" ? templateTypescript : templates).forEach((fileName, i) => {
      promises[i] = new Promise((res) => {
        fs.writeFile(
          `${appDirectory}/src/${fileName}`,
          selectedTemplate === "With Typescript" ? templateTypescript[fileName] : templates[fileName],
          function (err) {
            if (err) {
              return console.log(err)
            }
            res()
          }
        )
      })
    })
    Promise.all(promises).then(() => {
      resolve()
    })
  })
}

run()
