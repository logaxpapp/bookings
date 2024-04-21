import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../Header';
import SearchPanel from './SearchPanel';
import PublicRouteContainer from '../PublicRouteContainer';

const Search = () => {
  const [params, setParams] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const term = searchParams.get('term');
    const cityId = searchParams.get('city_id');
    const forceCurrentLocation = searchParams.get('force_current_location');
    setParams({ term, cityId, forceCurrentLocation });
  }, []);

  if (!params) {
    return null;
  }

  if (params.cityId) {
    return (
      <PublicRouteContainer>
        <div>
          <Header />
          <SearchPanel term={params.term} cityId={Number.parseInt(params.cityId, 10)} />
        </div>
      </PublicRouteContainer>
    );
  }

  return (
    <div className="container">
      <Header />
      <SearchPanel term={params.term} forceCurrentLocation={!!params.forceCurrentLocation} />
    </div>
  );
};

export default Search;
