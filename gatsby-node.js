const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

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
        createPage({
            path: c.node.channel.id,
            component: chanPage,
            context: {
                channel: c.node.channel.id
            }
        })

    }
}
