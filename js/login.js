const url = 'http://localhost:3000'
var localStore;

$(() => {
  authorizeUser()
  $('form.login').submit(logIn)
})

function authorizeUser() {
  var token = localStorage.getItem('token');
  if (token) {
    console.log("line 12");
    location.href = "./dashboard.html"
  }
}

function logIn(event) {
  event.preventDefault()
  const username = $('input[name=username').val()
  const password = $('input[name=password').val()
  const data = { username, password }
  console.log(data);
  $.post(`${url}/api/login`, data)
    .then(response => {
      if (response.error) {
        console.log(response.error);
      } else {
        localStorage.setItem('token', response.data)
        console.log("line 18");
        location.href = './dashboard.html';
      }
    })
}
