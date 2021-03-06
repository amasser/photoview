import React, { Component } from 'react'
import Layout from '../../Layout'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import PhotoGallery from '../../components/photoGallery/PhotoGallery'
import AlbumTitle from '../../components/AlbumTitle'

const photoQuery = gql`
  query allPhotosPage {
    myAlbums(filter: { order_by: "title", order_direction: ASC, limit: 100 }) {
      title
      id
      media(
        filter: { order_by: "media.title", order_direction: DESC, limit: 12 }
      ) {
        id
        title
        type
        thumbnail {
          url
          width
          height
        }
        highRes {
          url
          width
          height
        }
        videoWeb {
          url
        }
        favorite
      }
    }
  }
`

class PhotosPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      activeAlbumIndex: -1,
      activePhotoIndex: -1,
      presenting: false,
    }

    this.setPresenting = this.setPresenting.bind(this)
    this.nextImage = this.nextImage.bind(this)
    this.previousImage = this.previousImage.bind(this)

    this.albums = []
  }

  setActiveImage(album, photo) {
    this.setState({
      activePhotoIndex: photo,
      activeAlbumIndex: album,
    })
  }

  setPresenting(presenting, index) {
    if (presenting) {
      this.setState({
        presenting: index,
      })
    } else {
      this.setState({
        presenting: false,
      })
    }
  }

  nextImage() {
    const albumImageCount = this.albums[this.state.activeAlbumIndex].media
      .length

    if (this.state.activePhotoIndex + 1 < albumImageCount) {
      this.setState({
        activePhotoIndex: this.state.activePhotoIndex + 1,
      })
    }
  }

  previousImage() {
    if (this.state.activePhotoIndex > 0) {
      this.setState({
        activePhotoIndex: this.state.activePhotoIndex - 1,
      })
    }
  }

  render() {
    return (
      <Layout title="Photos">
        <Query query={photoQuery}>
          {({ loading, error, data }) => {
            if (error) return error

            if (loading) return null

            let galleryGroups = []

            this.albums = data.myAlbums

            if (data.myAlbums) {
              galleryGroups = data.myAlbums.map((album, index) => (
                <div key={album.id}>
                  <AlbumTitle album={album} />
                  <PhotoGallery
                    onSelectImage={photoIndex => {
                      this.setActiveImage(index, photoIndex)
                    }}
                    activeIndex={
                      this.state.activeAlbumIndex == index
                        ? this.state.activePhotoIndex
                        : -1
                    }
                    presenting={this.state.presenting === index}
                    setPresenting={presenting =>
                      this.setPresenting(presenting, index)
                    }
                    loading={loading}
                    media={album.media}
                    nextImage={this.nextImage}
                    previousImage={this.previousImage}
                  />
                </div>
              ))
            }

            let activeImage = null
            if (this.state.activeAlbumIndex != -1) {
              activeImage =
                data.myAlbums[this.state.activeAlbumIndex].media[
                  this.state.activePhotoIndex
                ].id
            }

            return <div>{galleryGroups}</div>
          }}
        </Query>
      </Layout>
    )
  }
}

export default PhotosPage
