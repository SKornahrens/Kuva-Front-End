const url = 'https://kuvafundb.herokuapp.com'

$(() => {
  authorizeUser()
  $('form.login').submit(logIn)
})

function authorizeUser() {
  var token = localStorage.getItem('token');
  if (token) {
    location.href = "./dashboard.html"
  }
}

function logIn(event) {
  event.preventDefault()
  const username = $('input[name=username').val()
  const password = $('input[name=password').val()
  const data = { username, password }
  $.post(`${url}/api/login`, data)
    .then(response => {
      if (response.error) {
        console.log(response.error);
      } else {
        $.get(`${url}/api/patrons`)
        .then(response => {
          for(var i = 0; i < response.length; i++) {
            console.log(response[i].username);
            if (response[i].username === username) {
                localStorage.setItem('user_id', response[i].user_id)
                localStorage.setItem('token', response.data)
                location.href = './dashboard.html';
            }
          }
        })
      }
    })
}
