const APIURL = 'https://api.github.com/users/'

const main = document.getElementById('main')
const form = document.getElementById('form')
const search = document.getElementById('search')
/*این تابع اگر اطلاعات کاربر در لوکال استوریج نباشد با فرستادن درخواستی اطلاعات مربوط به یوزر را می گیرد و در صورت عدم
 توانایی ارور مناسب را نمایش می دهد*/
async function getUser(username){
    try{
        if (window.localStorage.getItem(username)!=null) {
            console.log("check local storage for user")
            const data  =JSON.parse(window.localStorage.getItem(username))
            createUserCard(data)
            getRepos(username)
            
        } else {
            const { data } = await axios(APIURL + username)
            //console.log(data)
            createUserCard(data)
            getRepos(username)
            window.localStorage.setItem(username, JSON.stringify(data));
        }
    }catch (err){
        if(err.toJSON().message === 'Network Error'){
            createErrorCard('Network Connection Problem')
        }
        else{
            if(err.response.status == 404){
                createErrorCard('No profile Exist with this Username')
            }
            if(err.response.status == 408){
                createErrorCard('Request Timeout')
            }
            if(err.response.status == 410){
                createErrorCard('Content Has Been Permanently Deleted From Server')
            }
            if(err.response.status == 500){
                createErrorCard('Github Server Error')
            }
            if(err.response.status == 503){
                createErrorCard('Service Unavailable Error')
            }

        }

    }
}
/*این تابع اگر اطلاعات مخازن کاربر در لوکال استوریج نباشد با فرستادن درخواستی
اطلاعات مربوط به مخازن یوزر را می گیرد و در صورت عدم
 توانایی ارور مناسب را نمایش می دهد*/
async function getRepos(username){
    try{
        if (window.localStorage.getItem(username+' repo')!=null) {
            console.log("check local storage for user repositories")
            const data =JSON.parse(window.localStorage.getItem(username+' repo'))
            addReposToCard(data)
            addFavoriteLang(data)
        } else {
        const { data } = await axios(APIURL + username + '/repos?sort=created')
        addReposToCard(data)
        addFavoriteLang(data)
        window.localStorage.setItem(username+' repo', JSON.stringify(data));
        }
    }catch (err){
        createErrorCard('Problem Fetching Repos')

    }
}
/*این تابع یک کارت مناسب برای یوزر می سازد و با توجه به اطلاعات کاربر فایل اچ تی
ام ال را تغییر می دهد تا اطلاعات کاربر نمایش داده شوند*/ 
function createUserCard(user){

    if (user.bio!=null) {
        var bio= user.bio
        bio=bio.replace(/\n/g, "<br/>")
    }
    else{
        var bio = ""
    }
    if (user.name==null) {
        user.name=""
    }
    if (user.blog==null) {
        user.blog=""
    }
    if (user.location==null) {
        user.location=""
    }
    const cardHTML = `
        <div class="card">
            <div>
                <img src="${user.avatar_url}" alt="${user.name}" class="avatar">
            </div>
            <div class="user-info">
                <h2>${user.name}</h2>
                <p>${bio}</p>
                <p>${user.blog}</p>
                <p>${user.location}</p>
                <p id ="language"></p>
                <ul>
                    <li>${user.followers} <strong>Followers</strong></li>
                    <li>${user.following} <strong>Following</strong></li>
                    <li>${user.public_repos} <strong>Repos</strong></li>
                </ul>

                <div id="repos"></div>
            </div>
        </div>
    `
    main.innerHTML = cardHTML
}
/*کارت مربوط به ایجاد یک کارت برای نمایش خطا ها می باشد*/ 
function createErrorCard(msg){
    const cardHTML = `
        <div class="card">
            <h1>${msg}</h1>
        </div>
    `
    main.innerHTML = cardHTML
}
/*نام ریپازیتوری های اخیر را به کارت اضافه می کند*/ 
function addReposToCard(repos){
    const reposEl = document.getElementById('repos')

    repos
        .slice(0, 5)
        .forEach(repo => {
            const repoEl = document.createElement('a')
            repoEl.classList.add('repo')
            repoEl.href = repo.html_url
            repoEl.target = '_black'
            repoEl.innerText = repo.name

            reposEl.appendChild(repoEl)
        })
}
/*با محاسبه ی بایت های کد زده شده برای 5 ریپازیتوری اخیر کاربر زبان مورد علاقه ی
کاربر را نمایش می دهد*/ 
async function addFavoriteLang(repos){
    var results= [];
    for (let index = 0; index < Math.min(repos.length,5); index++) {
        var repo = repos[index]
        const response = await fetch(repo.languages_url);
        const textOfLang = await response.text();
        const listOfLang= JSON.parse(textOfLang);
        results.push(listOfLang)
        
    }
    var languages={}
    for (let index = 0; index < results.length; index++) {
        languages = Object.entries(results[index]).reduce((acc, [key, value]) => 
        ({ ...acc, [key]: (acc[key] || 0) + value })
,       { ...languages });
        
    }
    const favoriteLanguage=Object.keys(languages).reduce(function(a, b){ return languages[a] > languages[b] ? a : b })
    const langEl = document.getElementById('language').innerHTML="Favorite Language: "+favoriteLanguage
}
/*با زدن دکمه ی سابمیت نام کاربر را با فراخوانی تابع مناسب جستجو می کند*/ 
form.addEventListener('submit', (e) => {
    e.preventDefault()

    const user = search.value

    if(user){
        getUser(user)

        search.value = ''
    }
})


