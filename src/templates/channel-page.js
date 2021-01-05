import React from "react"
import { Link, graphql } from "gatsby"

// import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import id2pc from "../id2pc.json"

import "./channel-page.sass"
import Img from "gatsby-image"

function preprocessMessages(msgs) {
  const all = [];
  const talk = [];
  let lastmsg = null;
  let lastdiv = null;
  for (const m of msgs) {
    const name = id2pc[m.author.id] || m.author.id;
    const first = name.replace(/・.*?$/, "")
    m.content = m.content.replace("＠", "@")
    if (!lastmsg || lastmsg.author.id !== m.author.id) {
      if (lastdiv) talk.push(lastdiv);
      lastdiv = {
        author: m.author.id,
        name: name,
        first: first,
        msg: []
      };
    }
    if (m.mentions.length >= 2)
      m.content = "ERROR";
    else if (m.mentions.length === 1)
      m.content = m.content.replace(m.mentions[0].name, id2pc[m.mentions[0].id])
    for (const l of m.content.split("\n")) {
      lastdiv.msg.push(l)
    }
    lastmsg = m;
  }
  talk.push(lastdiv);
  return talk;
}

function renderMessages(msgs, imgs) {
  const ms = preprocessMessages(msgs);
  const talk = []
  for (const m of ms) {
    const allat = m.msg.every(x => x.startsWith("@") || x.startsWith("＠"))
    talk.push(<div className={allat ? "allat" : "normal-talk"}><Link class="pc-img-link" to={`https://mk.kuzumochi.work/pc/${m.name}`} alt={m.namen}>
      {
        imgs[m.name]?.childImageSharp.fixed ?
          <Img fixed={imgs[m.name]?.childImageSharp.fixed} className="pc-img" alt={m.first} /> :
          <div className="pc-img-alt">{m.first}</div>
      }
    </Link>
      <h3>{m.name}</h3>
      <div>
        {
          m.msg.map(x => <div className={x.startsWith("@") || x.startsWith("＠") ? "at" : "normal"}>{x}</div>)
        }
      </div>
    </div>)

  }
  return talk
  // const res = [];
  // let last = null;
  // for (const m of msgs) {
  //   const name = id2pc[m.author.id];
  //   if (!last || last.author.id !== m.author.id) {
  //     if (m.author.id === "209048672195969025") res.push(<h3 className="sidekick">Siekick</h3>)
  //     res.push(<h3 className={name}><GatsbyImage resolutions={imgs[name]?.childImageSharp.fixed} />{name || m.author.id}</h3>);
  //   }
  //   if (m.content.startsWith("@") | m.content.startsWith("＠")) {
  //     if (m.mentions.length >= 2)
  //       res.push("ERROR");
  //     else if (m.mentions.length === 1)
  //       res.push(<div>{m.content.replace(m.mentions[0].name, id2pc[m.mentions[0].id])}</div>)
  //     else
  //       res.push(<div className="at">{m.content}</div>)
  //   } else {
  //     res.push(<div>{m.content}</div>)
  //   }
  //   last = m;
  // }
  // return res;
}



const DiscordChannelTemplate = ({ data, location }) => {
  function createimageDict(images) {
    const list = {};
    for (const i of images) {
      list[i.node.fields["fullname"]] = i.node
    }
    return list;
  }
  const { channel, messages } = data.allDiscordJson.edges[0].node;
  const images = createimageDict(data.allFile.edges);
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
        {renderMessages(messages, images)}
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
  allFile(filter: {fields: {type: {eq: "pc"}}}) {
    edges {
      node {
        childImageSharp {
          fixed(width: 48, height: 48 , cropFocus: NORTH) {
            ...GatsbyImageSharpFixed
          }
        }
        id
        fields {
          link
          fullname
        }
      }
    }
  }
  allDiscordJson(filter: {channel: {id: {eq: $channel}}}) {
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
