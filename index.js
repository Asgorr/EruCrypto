const Discord = require('discord.js');
const { token, prefijo, link } = require('./config.json');
const client = new Discord.Client();
const { Pool } = require('pg');
const fetch = require("node-fetch");

const con = {
    user: 'postgres',
    host: 'localhost',
    password: 'masterkey',
    database: 'PVU'
};

const pool = new Pool(con);
var vPlanta;
var vHorarios;
let vCoordX;
let vCoordY;
var vPrecioPVU;
var slqQuery;
var vFilas;
var vCondicion2;
let idcanales = ['874715816032088124'];
let canalPrinc = '874715816032088124';
let Canal;


function getPrecio() {
    return new Promise(async function(resolve, reject) {
            const response = await fetch("https://api.pancakeswap.info/api/v2/tokens/0x31471e0791fcdbe82fbf4c44943255e923f1b794");
            const result = await response.json();
            
            if ( result.data.price > 0 ) {
                client.user.setActivity('PVU $' + Number.parseFloat(result.data.price).toFixed(2))
                resolve(vPrecioPVU = result.data.price);
            }
            else {
                reject();
            }
    });
}

        setInterval(() => {
            getPrecio();

            // client.channels.fetch(canalPrinc).then(channel => {
            //     traePlantas()
            //     .then(val => {
            //         vFilas = val.rows
            //         for (var i = 0; i < val.rowCount; i++) {
            //             console.log(vFilas);
            //             const exampleEmbed = new Discord.MessageEmbed()
            //             .setColor('#0099ff')
            //             .setTitle('La Planta se Reiniciara psiblemente en 20 Segundos XD')
            //             .addFields(
            //             { name: 'Coordenadas', value: '(' + vFilas[i].X + ',' + vFilas[i].Y + ')' },
            //             { name: 'Planta', value: link + vFilas[i].Planta },
            //             )
            //             .setTimestamp()
            //             .setFooter('Se envio el Mensaje', '');
            //             channel.send(exampleEmbed);
            //         }
            //     });
            // })

        }, 21000); 





function traePlantas()  {
    return new Promise(async function(resolve, reject) {
        try {
            var n = new Date();
            var hora = n.getHours();
            var minutos = n.getMinutes();
            var seg = n.getSeconds();
            let vSegundos1 = ((hora * 3600) + (minutos * 60) + seg) - 1
            let vSegundos2 = ((hora * 3600) + (minutos * 60) + seg) + 20

            let query = 'SELECT * FROM "Resets"."ResetPlants" WHERE "ResetPlants"."HoraJunta" BETWEEN $1 AND $2'
            let values = [vSegundos1, vSegundos2]
            
            const res = await pool.query(query,values);

            if ( res.rowCount > 0 ) {

                resolve(vPlanta = res);
            }
            else {
                console.log('No hay datos')
            }
        } catch(e) {
            console.log(e);
        }
    });
}

function traeHorarios()  {
    return new Promise(async function(resolve, reject) {
        try {
            var n = new Date();
            var hora = n.getHours();
            var minutos = n.getMinutes();
            var seg = n.getSeconds();
            let vSegundos1 = ((hora * 3600) + (minutos * 60) + seg)
            console.log(vSegundos1 + ' SEGUNDOS TOTALES')
            let query = 'SELECT * FROM "Resets"."HorariosGrupos" WHERE "HorariosGrupos"."Segundos1" <= $1 AND "HorariosGrupos"."Segundos2" >= $1'
            let values = [vSegundos1]
            
            const res = await pool.query(query,values);

            if ( res.rowCount > 0 ) {

                resolve(vHorarios = res);
            }
            else {
                console.log('No hay datos')
            }
        } catch(e) {
            console.log(e);
        }
    });
}

const traeCoordX = async () => {
    try {
        const res = await pool.query('SELECT "ResetPlants"."X" FROM "Resets"."ResetPlants" LIMIT 1');
        vCoordX = res.rows[0].X
    } catch(e) {
        console.log(e);
    }
}

const traeCoordY = async () => {
    try {
        const res = await pool.query('SELECT "ResetPlants"."Y" FROM "Resets"."ResetPlants" LIMIT 1');
        vCoordY = res.rows[0].Y
    } catch(e) {
        console.log(e);
    }
}

client.on('ready', () => {
	console.log('Ready!');
    client.user.setActivity('Buscando Precio PVU')
    // client.channels.fetch('874715816032088124').then(channel => {
    //     channel.send("Desgraciadoo por que me activas...")
    // })
});



let valor;
let multiplicador;
let multi;


//DONACION
client.on('message', msg => {
    valor = msg.content;
        if (valor === '!donacion') {
            if (multi <= 1) { 
                multi = 1
            }
            getPrecio()
            .then(val => {
                console.log(multi);
                const exampleEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Se acepta cualquier donacion :)')
                .setThumbnail('https://image.flaticon.com/icons/png/512/173/173222.png')
                .addFields(
                { name: 'Wallet:', value: '0x17baF11d13d653f1e1daa27fb8bd107Dc6365258' },
                )
                .setTimestamp()
                .setFooter('Muchas Gracias por tu Donacion :D', '');
        
                client.channels.fetch('871982490544406549').then(channel => {
                      channel.send(exampleEmbed)
                })
                
            }) 
        }     
    }); 


    //HORARIOS
client.on('message', msg => {
    valor = msg.content;
        if (valor === '!grupo') {
            traeHorarios()
            .then(val => {
                vFilas = val.rows;
                console.log(vFilas);
                if (vFilas[0].Grupo === 'G1') {
                    const exampleEmbed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('En este momento esta el Grupo 1')
                    .setImage('https://i.imgur.com/arqGLgb.png')
                    .setTimestamp()
                    .setFooter('Se envio el Mensaje', '');
            
                    client.channels.fetch('871982490544406549').then(channel => {
                          channel.send(exampleEmbed)
                    })
                } else if (vFilas[0].Grupo === 'G2') {
                    const exampleEmbed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('En este momento esta el Grupo 2')
                    .setImage('https://i.imgur.com/arqGLgb.png')
                    .setTimestamp()
                    .setFooter('Se envio el Mensaje', '');
            
                    client.channels.fetch('871982490544406549').then(channel => {
                          channel.send(exampleEmbed)
                    })
                } else if (vFilas[0].Grupo === 'G3') { 
                    const exampleEmbed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('En este momento esta el Grupo 3')
                    .setImage('https://i.imgur.com/arqGLgb.png')
                    .setTimestamp()
                    .setFooter('Se envio el Mensaje', '');
            
                    client.channels.fetch('871982490544406549').then(channel => {
                          channel.send(exampleEmbed)
                    })
                }

            }) 
        }     
    });



//VALOR PVU
client.on('message', msg => {
    valor = msg.content;
    multi = valor.substring(4,8);
    valor = valor.substring(0,4);
        if (valor === '!pvu') {
            if (multi <= 1) { 
                multi = 1
            }
            getPrecio()
            .then(val => {
                console.log(multi);
                const exampleEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Plants vs Undead')
                .setThumbnail('https://image.flaticon.com/icons/png/512/173/173222.png')
                .addFields(
                { name: 'Valor PVU:', value: '$' + Number.parseFloat(val * multi).toFixed(2) },
                { name: 'Valor PVU-MXN:', value: '$' + Number.parseFloat((val * 20.40) * multi).toFixed(2) },
                )
                .setTimestamp()
                .setFooter('Se envio el Mensaje', '');
        
                client.channels.fetch('871982490544406549').then(channel => {
                      channel.send(exampleEmbed)
                })
                
                client.user.setActivity('PVU $'+ Number.parseFloat(val).toFixed(2))
            }) 
        }     
    }); 

//CONVERSION LE A PVU
    let comision = 0.054;
    let pvu;
    let leingre;
    let pvuLE = 150;
    client.on('message', msg => {
        valor = msg.content;
        pvu = valor.substring(8,12);
        valor = valor.substring(0,8);
        console.log(pvu);
            if (valor === '!cambiar') {
                if (pvu <= 1) { 
                    pvu = 1
                }
                let result = (pvuLE * comision) * pvu;
                leingre = (pvuLE * pvu) + result;

                //CONSTRUYO MENSAJE
                const exampleEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Para obtener ' + pvu + ' PVU')
                .setThumbnail('https://image.flaticon.com/icons/png/512/173/173222.png')
                .addFields(
                { name: 'Debes ingresar: ', value: leingre + ' LE' },
                )
                .setTimestamp()
                .setFooter('Se envio el Mensaje', '');
        
                client.channels.fetch('871982490544406549').then(channel => {
                      channel.send(exampleEmbed)
                })
            }     
        }); 
    // client.on('message', msg => {
    //     valor = msg.content;
    //     if (msg.member.roles.cache.has('879072944448495696')) {
    //         if(valor === '!setvip') {
    //         canalPrinc = idcanales[1];     
    //         const exampleEmbed = new Discord.MessageEmbed()
    //         .setColor('#0099ff')
    //         .setTitle('Cambiando a Canal VIP')
    //         .setTimestamp()
    //         .setFooter('Se envio el Mensaje', '');
        
    //         msg.channel.send(exampleEmbed);
    //         console.log(canalPrinc)
    //         } else if(valor === '!setnormal') {
    //             canalPrinc = idcanales[0]; 
    //             const exampleEmbed = new Discord.MessageEmbed()
    //             .setColor('#0099ff')
    //             .setTitle('Cambiando a Canal Publico')
    //             .setTimestamp()
    //             .setFooter('Se envio el Mensaje', '');
            
    //             msg.channel.send(exampleEmbed);
    //             console.log(canalPrinc)
    //         }
    //     }
    // });

    // client.on('message', msg => {
    //     valor = msg.content;
    //     if (msg.member.roles.cache.has('879072944448495696')) {
    //         if(valor === '!iniciar') {
    //         var vReloj = vIniciar();
    //         const exampleEmbed = new Discord.MessageEmbed()
    //         .setColor('#0099ff')
    //         .setTitle('Se Activo la Busqueda de Plantas')
    //         .setTimestamp()
    //         .setFooter('Se envio el Mensaje', ''); 
        
    //         msg.channel.send(exampleEmbed);
    //         console.log(canalPrinc)
    //         } else if(valor === '!detener') {
    //             clearInterval(vReloj);
    //             const exampleEmbed = new Discord.MessageEmbed()
    //             .setColor('#0099ff')
    //             .setTitle('Se detuvo la Busqueda de Plantas')
    //             .setTimestamp()
    //             .setFooter('Se envio el Mensaje', '');
            
    //             msg.channel.send(exampleEmbed);
    //             console.log(canalPrinc)
    //         }
    //     }
    // });

client.on('message', msg => { 
    valor = msg.content;
    console.log(valor); 
    if(valor === '!ho') {

        const exampleEmbed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('La Planta se Reiniciara psiblemente en 20 Segundos XD')
                    .addFields(
                    { name: 'Coordenadas', value: '(' + vCoordX + ',' + vCoordY + ')' },
                    { name: 'Planta', value: 'https://marketplace.plantvsundead.com/marketplace/plant#/farm/' + vPlanta },
                    )
            .setTimestamp() 
            .setFooter('Se envio el Mensaje', '');
                
            msg.reply(exampleEmbed); 
    }
});

//COMANDOS BOT
client.on('message', msg => { 
    valor = msg.content;
    if(valor === '!comandos') {

        const exampleEmbed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('Comandos con los que te respondere')
                    .addFields(
                    { name: 'PLANTS VS UNDEAD', value: 'PVU' },
                    { name: '!pvu', value: 'Te dare el precio actual del PVU, si agregas un numero despues de la palabra !pvu7 te dire la conversion.' },
                    { name: '!becados', value: 'Te dire quienes son los becados en PVU actualmente' },
                    { name: '!espera', value: 'Te dire quienes son los que se encuentran en la lista de espera para PVU.' },
                    { name: '!cambiar', value: 'Te dire la cantidad de LE que necesitas para cambiar, si agregas un numero despues de la palabra !cambiar7 te dire la conversion.' },
                    { name: 'STREAM DUNGEONS', value: 'STD' },
                    { name: '!std', value: 'Te dare el precio actual del STD, si agregas un numero despues de la palabra !std7 te dire la conversion.' },
                    { name: 'EXTRAS', value: 'S' },
                    { name: '!donacion', value: 'Por si quieres realizar cualquier donacion :)' },
                    )
            .setTimestamp() 
            .setFooter('Se envio el Mensaje', '');
                
            client.channels.fetch('871982490544406549').then(channel => {
                channel.send(exampleEmbed)
          })
    }
});


//BECADO Y LISTA ESPERA
client.on('message', msg => { 
    let eEmbed = new Discord.MessageEmbed()
    valor = msg.content;
    switch(valor) {
        case '!becados':
            eEmbed
            .setColor('#0099ff')
            .setTitle('Becados Actualmente')
            .addFields(
                { name: 'Dunkle Koing', value: 'Fue becado por Erulaz el dia 25/08/2021' },
                { name: 'Morin', value: 'Fue becado por Asgor el dia 26/08/2021' },
                { name: 'Kirosawa', value: 'Fue becado por JhojanR13 el dia 31/08/2021' },
                )
            .setTimestamp() 
            .setFooter('Se envio el Mensaje', '');
                
            client.channels.fetch('871982490544406549').then(channel => {
                channel.send(eEmbed)
            })
          break;
        case '!espera':
            eEmbed
            .setColor('#0099ff')
            .setTitle('Lista de Espera para PVU')
            .addFields(
                { name: 'No hay lista de Espera', value: 'Si te quieres anotar en la lista debes esperar a que terminen los Becados' },
                )
            .setTimestamp() 
            .setFooter('Se envio el Mensaje', '');
            client.channels.fetch('871982490544406549').then(channel => {
                channel.send(eEmbed)
            })
            break;
        case '!std':
                eEmbed
                .setColor('#0099ff')
                .setTitle('Aun no dan de alta el Token para saber el Precio')
                .setTimestamp() 
                .setFooter('Se envio el Mensaje', '');
                    
                client.channels.fetch('879713788385980416').then(channel => {
                    channel.send(eEmbed)
                })
            break;

        default:
            
      }  
});









//Canal de testeo 484832982322905109

//GRUPOS PVU
// client.on('message', msg => { 
//     let eEmbed = new Discord.MessageEmbed()
//     valor = msg.content;
//     var n = new Date();
//     var hora = n.getHours();
//     var minutos = n.getMinutes();
//     var minlen = String(minutos).length;
//     var min;
//     if (minlen < 2) { 
//         min = '0' + String(minutos)
    
//     } else { min = String(minutos) }
//     var hm = String(hora) + String(min);
//     if (valor === '!grupo') {
//         console.log(hm);
//         if ((hm >= 1941 && hm <= 1840) || (hm >= 2341 && hm <= 2440 ) || (hm >= 341 && hm <= 440 ) || (hm >= 741 && hm <= 840 ) || (hm >= 1141 && hm <= 1240 ) || (hm >= 1541 && hm <= 1640 )) {
//             eEmbed
//             .setColor('#ff0000')
//             .setTitle('En este momento esta el Grupo 1')
//             .setImage('https://i.imgur.com/zL10YIS.png')
//             .setTimestamp() 
//             .setFooter('Se envio el Mensaje', '');
                
//             client.channels.fetch('871982490544406549').then(channel => {
//                 channel.send(eEmbed)
//             })

//         } else if ((hm >= 2041 && hm <= 2140) || (hm >= 441 && hm <= 540 ) || (hm >= 841 && hm <= 940 ) || (hm >= 1241 && hm <= 1340 ) || (hm >= 1641 && hm <= 1740 )) {
//             eEmbed
//             .setColor('#ff0000')
//             .setTitle('En este momento esta el Grupo 2')
//             .setImage('https://i.imgur.com/zL10YIS.png')
//             .setTimestamp() 
//             .setFooter('Se envio el Mensaje', '');
                
//             client.channels.fetch('871982490544406549').then(channel => {
//                 channel.send(eEmbed)
//             })

//         } else if ((hm >= 2141 && hm <= 2240) || (hm >= 141 && hm <= 240 ) || (hm >= 541 && hm <= 640 ) || (hm >= 941 && hm <= 1040 ) || (hm >= 1341 && hm <= 1440 ) || (hm >= 1741 && hm <= 1840 )) {
//             eEmbed
//             .setColor('#ff0000')
//             .setTitle('En este momento esta el Grupo 3')
//             .setImage('https://i.imgur.com/zL10YIS.png')
//             .setTimestamp() 
//             .setFooter('Se envio el Mensaje', '');
                
//             client.channels.fetch('871982490544406549').then(channel => {
//                 channel.send(eEmbed)
//             })

//         } else if ((hm >= 2241 && hm <= 2340) || (hm >= 241 && hm <= 340 ) || (hm >= 640 && hm <= 740 ) || (hm >= 1041 && hm <= 1140 ) || (hm >= 1441 && hm <= 1540 ) || (hm >= 1841 && hm <= 1940 )) {
//             eEmbed
//             .setColor('#ff0000')
//             .setTitle('En este momento esta el Grupo 4')
//             .setImage('https://i.imgur.com/zL10YIS.png')
//             .setTimestamp() 
//             .setFooter('Se envio el Mensaje', '');
                
//             client.channels.fetch('871982490544406549').then(channel => {
//                 channel.send(eEmbed)
//             })

//         }
//     } 
// });

client.login(token);