const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
if (process.argv.length < 3) {
    console.error(`You need to provide a name. I.e. node new_user.js "David"`)
    process.exit(1)
}
var name = process.argv[2].toLowerCase().trim()
if (name.split(" ").length > 1) {
    console.error(`Please, no spaces in the username.`)
    process.exit(1)
}


async function del(){
    var res = await prisma.user.findFirst({ where: { name: name}})
    if (!res) {
        console.error(`That user does not exist.`)
        process.exit(1)
    }
    var user = await prisma.user.delete({
        where: {id: res.id}
    })
     console.log(`Deleted user: ${name}. User ID: ${user.id}`)
}
del()