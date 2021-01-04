import React from "react"
import { Link, graphql } from "gatsby"

// import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import id2pc from "../id2pc.json"
import "./channel-page.css"

function renderMessages(msgs)
{
  const res = [];
  let last = null;
  for(const m of msgs)
  {
    if(!last || last.author.id !== m.author.id)
    {
      if(m.author.id==="209048672195969025") res.push(<h3 className="sidekick">Siekick</h3>)
      res.push( <h3 className={id2pc[m.author.id]}>{id2pc[m.author.id] || m.author.id}</h3> );
    }
    if( m.content.startsWith("@") | m.content.startsWith("＠"))
    {
      if(m.mentions.length >= 2)
        res.push("ERROR");
      else if (m.mentions.length === 1)
        res.push(<div>{m.content.replace(m.mentions[0].name,id2pc[m.mentions[0].id])}</div>)
      else 
        res.push(<div className="at">{m.content}</div>)
    }else{
        res.push(<div>{m.content}</div>)
    }
    last = m;
  }
  return res;
}

const DiscordChannelTemplate = (props) => {
  console.log(props); const { data, location } = props;

  const { channel, messages } = data.allDiscordJson.edges[0].node;
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const { previous, next } = data

  return (
    <Layout location={location} title={siteTitle}>
      <SEO
        title={channel.name}
        description={channel.name}
      />
      <article
        className="blog-post"
      >
        {renderMessages(messages)}
      </article>
    </Layout>
  )
}

export default DiscordChannelTemplate

export const pageQuery = graphql`
query DiscordChannelQuery($channel: String!) {
  site {
    siteMetadata {
      title
    }
  }
  allDiscordJson(filter: { channel : {id: {eq:$channel} } }) {
    edges {
      node {
        messages {
          author {
            id
            name
          }
          mentions {
            name
            id
          }
          timestamp
          content
          id
        }
        channel {
          id
          name
        }
      }
    }
  }
}
`
