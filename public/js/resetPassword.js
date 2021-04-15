async function resetPassword(){
	let reset_error=document.querySelector(".reset_error");
	let reset_password=document.querySelector(".reset_password").value;
	if(reset_password){
	let body=JSON.stringify({"password":reset_password});
	let res=await fetch("#",{
											method:"post",
											headers:{"Content-Type":"application/json"},
											body:body
										}
							);

	res=await res.json();
	
	if(res.status==="Sucess"){
		reset_error.innerText=res.msg;
		reset_error.style.color="green";
		reset_error.style.display="initial";
	}
	else{
		reset_error.innerText=res.msg;
		reset_error.style.color="red";
		reset_error.style.display="initial";		
	}
	}
}

function main()
{
	let change_password=document.querySelector(".change_password");
	change_password.addEventListener("click",resetPassword);

}
main();