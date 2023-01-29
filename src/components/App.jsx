import { Component } from 'react';
import SearchBar from './SearchBar/SearchBar';
import fetchImages from 'services/api';
import ImageGallery from './ImageGallery/ImageGallery';
import Button from './Button/Button';
import Loader from './Loader/Loader';

class App extends Component {
  state = {
    query: '',
    images: [],
    page: 1,
    totalHits: 0,
    loading: false,
    error: null,
  };

  componentDidUpdate(prevProps, prevState) {
    const { query, page } = this.state;
    if (prevState.query !== query) {
      this.reset();
      this.getImages();
    }
    if (prevState.page !== page) {
      this.getImages();
    }
  }

  async getImages() {
    try {
      this.setState({ loading: true, error: null });
      const { query, page } = this.state;
      const { hits, totalHits } = await fetchImages(query, page);
      const imgArr = hits.map(({ id, largeImageURL, webformatURL, tags }) => {
        return { id, largeImageURL, webformatURL, tags };
      });

      if (query.trim() === '') {
        this.setState({
          error: 'You cannot search by empty field, try again.',
        });
      } else if (hits.length === 0) {
        this.setState({
          error:
            'Sorry, there are no images matching your search query. Please try again.',
        });
      } else {
        this.setState(prevState => ({
          images: [...prevState.images, ...imgArr],
          totalHits,
        }));
      }
      console.log(this.state.images);
    } catch (error) {
      this.setState({ error: error.message });
    } finally {
      this.setState({ loading: false });
    }
  }

  handleSearchFormSubmit = query => {
    this.setState({ query });
  };
  loadMore = () => {
    this.setState(prevState => ({ page: prevState.page + 1 }));
  };
  reset = () => {
    this.setState({ page: 1, images: [] });
  };

  render() {
    const { images, loading, error, totalHits } = this.state;
    return (
      <div>
        <SearchBar onSubmit={this.handleSearchFormSubmit} />
        {images.length > 0 && <ImageGallery items={images} />}
        {totalHits > 12 && (
          <Button type="button" label="Load more" changePage={this.loadMore} />
        )}
        {loading && <Loader />}
        {error && <p>{error}</p>}
      </div>
    );
  }
}

export default App;
