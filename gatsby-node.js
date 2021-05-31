const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)
const fetch = require('node-fetch');

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  // Define a template for blog post
  const chanPage = path.resolve(`./src/templates/channel-page.js`)

  // Get all markdown blog posts sorted by date
  const result = await graphql(
    `
    {
      allDiscordJson {
        edges {
          node {
            channel {
              id
              name
              category
            }
          }
        }
      }
    }
    `
  )

  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading`,
      result.errors
    )
    return
  }

  const channels = result.data.allDiscordJson.edges;

  // Create blog posts pages
  // But only if there's at least one markdown file found at "content/blog" (defined in gatsby-config.js)
  // `context` is available in the template as a prop and as a variable in GraphQL

  for (c of channels) {
    if (c.node.channel.category === "PC間交流チャンネル" || c.node.channel.category === "対NPC相談チャンネル")
      createPage({
        path: c.node.channel.id,
        component: chanPage,
        context: {
          channel: c.node.channel.id
        }
      })
  }
}

const { createRemoteFileNode } = require(`gatsby-source-filesystem`);

// sourceNodesにて外部画像のファイルノードを作成する
exports.sourceNodes = async ({ actions, createNodeId, cache, store }) => {
  const pc_data = await fetch("https://script.googleusercontent.com/macros/echo?user_content_key=r-I00_nsEOr0PGentTUX9DSmq92qf0-XuPlpDlJPYf5TuK1F1afqdYWZtOtYyBInXAWTp-SPccw6dWbgbEgYzyaukzs0NzWzm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnBYxO4Ik933KBgKeyvHNwfXUCyTu138mxRtPqjnFz2ES3s7yjnFmyge2GobZCumAykW-dnclfdIe&lib=MR4Oy3jvuDgy_WSouDhLVM1tXpvbgGpFr").then(x => x.json())

  const pcs = pc_data.map((x, i) => ({ index: i, ...x }))
  await Promise.all(pcs.map(async p => {
    if (p.chara_card === "") return;

    // createRemoteFileNodeで外部の画像のファイルノードを作成する
    try {
      const fileNode = await createRemoteFileNode({
        url: p.chara_card,
        cache,
        store,
        createNodeId,
        createNode: actions.createNode,
        name: p.index
      });

      await actions.createNodeField({
        node: fileNode,
        name: "type",
        value: "pc"
      });
      await actions.createNodeField({
        node: fileNode,
        name: "fullname",
        value: p.firstname + (p.lastname === "" ? "" : "・" + p.lastname),
      });

      // メタ情報として画像のURLを付与
      await actions.createNodeField({
        node: fileNode,
        name: 'link',
        value: p.chara_card,
      });

      return fileNode;
    } catch (e) { }
  }));
}
