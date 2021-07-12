const url = 'https://ke-image.ljcdn.com/110000-inspection/pc0_lmjbupFUG_2.jpg!m_fill,w_780,h_439,l_fbk,o_auto'
const axios = require('axios').default
const crypto = require('crypto')
const Minio = require('minio')
const env = require('./.env')
const fs = require('fs/promises')
const path = require('path');
const dataFolder = path.resolve(__dirname, './images')

const minioClient = new Minio.Client(env);

async function main() {
    const data = (await axios.get(url, { responseType: 'arraybuffer' })).data
    
    let name = ''
    await new Promise((a, b) => {
        crypto.randomBytes(5, async (err, buf) => {
            if (err) throw err;
            name = buf.toString('hex')
            name = `${name}.${url.includes('png') ? 'png' : 'jpg'}`
            const r = (await axios.get('http://localhost:3383/upload', {
                params: {
                    type: 'house',
                    file_name: name,
                }, headers: {
                    'x-api-token': '28a9e51c15752499d435291a132a8a7fb9a51318'
                }
            })).data.result
            console.log(r)
            await fs.writeFile(path.resolve(dataFolder, name), Buffer.from(data.buffer));
            // console.log(data.buffer)
            const file = path.resolve(dataFolder, name)
            await new Promise((res, rej) => {
                minioClient.fPutObject('house', name, file, r.url.formData, function(err, objInfo) {
                    if(err) {
                        throw err
                    }
                    res(objInfo)
                })
            })
            a();
        });
    })
    console.log(name)
    return name
}

main()