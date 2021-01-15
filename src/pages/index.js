import * as React from "react"
import orderBy from "lodash/orderBy";
import { Link } from "gatsby";

// markup
const IndexPage = ({ data, location }) => {
  const channel = data.allDiscordJson.edges
  return (
    <main>
      <ul>
        {
          orderBy(channel.map(c => c.node.channel), ["category", "name"])
            .filter(c => c.category === "PC間交流チャンネル" || c.category === "対NPC相談チャンネル")
            .map(c => <li><Link to={`/${c.id}`}>{c.category}::{c.name}</Link></li>)
        }
      </ul>

      ↓↓↓↓↓キケン↓↓↓↓<br />
      <Link to="/all">すべて</Link><br />
      ↑↑↑↑↑ 13MBぐらいあります ↑↑↑↑↑<br />
      スマホの方は非推奨
    </main>
  )
}
export const pageQuery = graphql`
query DiscordIndexQuery {
  site {
    siteMetadata {
      title
    }
  }
  allDiscordJson {
    edges {
      node {
        channel {
          id
          category
          name
        }
      }
    }
  }
}
`


export default IndexPage
