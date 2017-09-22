
$('#SignOut').on('click', function(){
  localStorage.removeItem('token');
  localStorage.removeItem('user_id');
  location.href = './index.html'
})
