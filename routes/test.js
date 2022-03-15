
function take(n){
    return new Promise(resolve => {
        setTimeout(()=>resolve(n+300),n)
    })
}
function step1(n){
    return new Promise(resolve => {
        resolve(n)
    })
}
function step2(m,n){
    return new Promise(resolve => {
        resolve(m+n)
    })
}
function step3(k,m,n){
    return new Promise(resolve => {
        resolve(k+m+n)
    })
}

async function doIt(){
    const time1 = 100;
    console.log(`time1: ${time1}`)
    const time2 = await step1(time1);
    console.log(`time2: ${time2}`)
    const time3 = await step2(time1,time2);
    console.log(`time3: ${time3}`)
    const result = await step3(time1,time2,time3);
    console.log(`result: ${result}`)
    console.log(result)
}

doIt()
