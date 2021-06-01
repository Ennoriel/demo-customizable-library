var ghpages = require('gh-pages');

ghpages.publish(
  'public',
  {
    branch: 'master',
    repo: 'git@github.com:Ennoriel/customizable-library.git',
    user: {
      name: 'Maxime Dupont',
      email: 'emixamdupont@gmail.com'
    }
  },
  () => {
    console.log('Deploy Complete!')
  }
)