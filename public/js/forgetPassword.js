async function forgetPassword(){
	let forget_error=document.querySelector(".forget_error");
	let forget_email=document.querySelector(".forget_email").value;
	if(forget_email){
	let body=JSON.stringify({"email":forget_email});
	let res=await fetch("/forget/password",{
											method:"post",
											headers:{"Content-Type":"application/json"},
											body:body
										}
							);

	res=await res.json();
	if(res.status==="Sucess"){
		forget_error.innerText=res.msg;
		forget_error.style.color="green";
		forget_error.style.display="initial";

	}
	else{
		forget_error.innerText=res.msg;
		forget_error.style.color="red";
		forget_error.style.display="initial";		
	}
	}
}

function main()
{
	let send_link=document.querySelector(".send_link");
	send_link.addEventListener("click",forgetPassword);

}
main();