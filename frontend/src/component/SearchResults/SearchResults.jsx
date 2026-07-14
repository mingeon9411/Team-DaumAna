import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchProducts } from '../../api';
import localProducts from '../../data/products';
import './SearchResults.css';

function SearchResults() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!query.trim()) return;
        setLoading(true);
        setError('');
        searchProducts(query)
            .then((res) => setProducts(res.data))
            .catch(() => setError('검색 중 오류가 발생했습니다.'))
            .finally(() => setLoading(false));
    }, [query]);

    return (
        <div className="srPage">
            <div className="srWrap" data-hsnap>
                <div className="srHeader">
                    <h2 className="srTitle">
                        {query ? (
                            <><span className="srKeyword">"{query}"</span> 검색 결과</>
                        ) : '검색어를 입력해주세요'}
                    </h2>
                    {!loading && query && (
                        <p className="srCount">총 {products.length}개 상품</p>
                    )}
                </div>

                {loading && <p className="srLoading">검색 중...</p>}
                {error && <p className="srError">{error}</p>}

                {!loading && !error && products.length === 0 && query && (
                    <div className="srEmpty">
                        <p>"{query}"에 대한 검색 결과가 없습니다.</p>
                        <p className="srEmptySub">다른 키워드로 검색해보세요.</p>
                    </div>
                )}
            </div>

            <ul className="srGrid">
                {products.map((product) => (
                    <li key={product.id} className="srCard">
                        <Link to={`/product/${product.id}`} className="srCardLink">
                            <div className="srImgWrap">
                                <img
                                    src={localProducts.find(p => p.name === product.name)?.image || product.thumbnail_url || 'https://placehold.co/400x400?text=No+Image'}
                                    alt={product.name}
                                    className="srImg"
                                />
                            </div>
                            <div className="srInfo">
                                <span className="srCategory">{product.category_name}</span>
                                <p className="srName">{product.name}</p>
                                <p className="srBrand">{product.brand}</p>
                                <p className="srPrice">{product.base_price.toLocaleString()}원</p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SearchResults;
