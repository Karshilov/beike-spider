const url = 'https://ke-image.ljcdn.com/110000-inspection/pc0_lmjbupFUG_2.jpg!m_fill,w_780,h_439,l_fbk,o_auto'
const axios = require('axios').default
const crypto = require('crypto')

async function main() {
    const data = (await axios.get(url)).data
    let name = ''
    crypto.randomBytes(5, (err, buf) => {
        if (err) throw err;
        name = buf.toString('hex')
    });
    
    
}

main()