import inquirer from 'inquirer';

export const prompt = {
  text: async (message: string): Promise<{ [key: string]: string }> => {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'value',
        message,
        validate: (input) => input.length > 0 || 'This field is required'
      }
    ]);
  },

  select: async (message: string, choices: { name: string; value: string }[]): Promise<{ [key: string]: string }> => {
    return inquirer.prompt([
      {
        type: 'list',
        name: 'value',
        message,
        choices
      }
    ]);
  },

  confirm: async (message: string): Promise<{ [key: string]: boolean }> => {
    return inquirer.prompt([
      {
        type: 'confirm',
        name: 'value',
        message,
        default: false
      }
    ]);
  }
}; 