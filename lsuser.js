const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function list(){
    var users = await prisma.user.findMany()
    console.log(`${users.length} users found.`)
    users.forEach(async function(user){
        var posts = await prisma.posts.findMany({where: {userId: user.id}})
        console.log(`- ${user.name} (${posts.length} post(s) made)`)
    })
}
list()