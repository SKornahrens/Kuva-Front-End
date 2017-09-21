
$('#SignOut').on('click', function(){
  localStorage.removeItem('token');
  location.href = './index.html'
})
