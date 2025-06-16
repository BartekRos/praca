// src/pages/TripsPage.js
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';
import CreateTripPostSection from '../components/CreateTripPostSection';
import TripPostCard from '../components/TripPostCard';
import TripPostModal from '../components/TripPostModal';
import './styles/HomePage.css';

const TripsPage = () => {
  const { user } = useContext(AuthContext);

  /* ---------- STAN ---------- */
  const [tripPosts,        setTripPosts]        = useState([]);
  const [filteredTripPosts,setFilteredTripPosts]= useState([]);
  const [likeCounts,       setLikeCounts]       = useState({});
  const [showCreateForm,   setShowCreateForm]   = useState(false);
  const [selectedPost,     setSelectedPost]     = useState(null);
  const [scrollToComment,  setScrollToComment]  = useState(false);
  const [sortOption,       setSortOption]       = useState('newest');

  const [filters, setFilters] = useState({
    location : '',
    cost     : '',
    duration : '',
  });

  /* ============ POBIERANIE DANYCH ============ */
  const fetchTripPosts = useCallback(async () => {
    try {
      const res  = await fetch('http://localhost:5000/api/trip-posts');
      const data = await res.json();

      // ---- liczby lajków ----
      const countsArr = await Promise.all(
        data.map(async (p) => {
          const r = await fetch(`http://localhost:5000/api/trip-posts/${p.id}/likes-count`);
          const { count } = await r.json();
          return { id: p.id, count };
        })
      );
      const countsMap = countsArr.reduce((a,c)=>({...a,[c.id]:c.count}),{});
      setLikeCounts(countsMap);

      // ---- czy aktualny użytkownik polubił ----
      if (user) {
        await Promise.all(
          data.map(async (p) => {
            const r = await fetch(`http://localhost:5000/api/trip-posts/${p.id}/liked`, {
              headers: { Authorization: `Bearer ${user.token}` },
            });
            const { liked } = await r.json();
            p.likedByCurrentUser = liked;
          })
        );
      }

      data.sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt));
      setTripPosts(data);
      setFilteredTripPosts(data);
    } catch (err) {
      console.error('❌ Błąd pobierania relacji:', err);
    }
  }, [user]);

  useEffect(() => { fetchTripPosts(); }, [fetchTripPosts]);

  /* ============ FILTRY + SORT ============ */
  const sortPosts = (arr) => {
    if (sortOption === 'popular') {
      arr.sort((a,b)=>(likeCounts[b.id]||0)-(likeCounts[a.id]||0));
    } else {
      arr.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    }
  };

  const applyFilters = () => {
    const { location, cost, duration } = filters;

    let result = tripPosts.filter((p)=>{
      const titleOk    = location  ? p.title.toLowerCase().includes(location.toLowerCase()) : true;
      const costOk     = cost      ? +p.price <= +cost : true;
      const durationOk = duration  ? p.duration === +duration : true;
      return titleOk && costOk && durationOk;
    });

    sortPosts(result);
    setFilteredTripPosts(result);
  };

  /* ---------- obsługa filtrów / sortu ---------- */
  const handleFilterChange = (f,v)=>setFilters(prev=>({...prev,[f]:v}));
  const handleSortChange   = (e)=>{ setSortOption(e.target.value); applyFilters(); };

  /* ============ AKTUALIZACJA LAJKA ============ */
  /** Przyjmujemy: (postId, newCount, likedFlag) – kolejność zgodna
   *  z wywołaniami w TripPostCard / TripPostModal */
  const updatePostLike = (postId, newCount, liked) => {
    // 1️⃣ liczba lajków
    setLikeCounts(prev => ({ ...prev, [postId]: newCount }));

    // 2️⃣ flaga likedByCurrentUser
    const mutate = p => p.id === postId ? { ...p, likedByCurrentUser: liked } : p;

    setTripPosts(prev => prev.map(mutate));
    setFilteredTripPosts(prev => {
      const upd = prev.map(mutate);
      if (sortOption === 'popular') sortPosts(upd);
      return [...upd];
    });
  };

  /* ============ DODAWANIE NOWEGO POSTA ============ */
  const handleCreateTripPost = async (formData) => {

    try {
      const res = await fetch('http://localhost:5000/api/trip-posts', {
        method: 'POST',
        headers:{ Authorization:`Bearer ${user.token}` },
        body: formData,
      });
      const newPost = await res.json();

      setTripPosts(prev => [newPost, ...prev]);
      setFilteredTripPosts(prev => [newPost, ...prev]);
      setLikeCounts(prev => ({ ...prev, [newPost.id]: 0 }));
      setShowCreateForm(false);
    
  
        // ⬇️ przewiń stronę na samą górę
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
      } catch (error) {
        console.error("Błąd dodawania posta:", error);
        alert("Wystąpił błąd przy dodawaniu posta");
      }
    };
    

  /* ---------- blokada scrolla przy modal ---------- */
  useEffect(()=>{
    document.body.style.overflow = selectedPost ? 'hidden' : 'auto';
    return ()=>{ document.body.style.overflow='auto'; };
  },[selectedPost]);

  /* ---------- auto-scroll do pola komentarza ---------- */
  useEffect(()=>{
    if (scrollToComment){
      setTimeout(()=>{
        const el=document.querySelector('.trip-comments-section textarea');
        el?.scrollIntoView({behavior:'smooth',block:'center'});
        el?.focus();
        setScrollToComment(false);
      },150);
    }
  },[scrollToComment]);

  /* ================================================= */
  return (
    <>
      <Navbar />

      <div className="homepage-container">
        {/* ---------- SIDEBAR ---------- */}
        <div className="sidebar-left">
          {!showCreateForm && (
            <>
              <button className="add-post-sidebar" onClick={()=>setShowCreateForm(true)}>
                + Dodaj post
              </button>

              <div className="filters-container">
                <h4>Filtry</h4>
                <input
                  type="text"
                  placeholder="Kraj/Miasto"
                  value={filters.location}
                  onChange={e=>handleFilterChange('location',e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Koszta do"
                  value={filters.cost}
                  onChange={e=>handleFilterChange('cost',e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Liczba spędzonych dni"
                  value={filters.duration}
                  onChange={e=>handleFilterChange('duration',e.target.value)}
                />

                <select className="sort-select" value={sortOption} onChange={handleSortChange}>
                  <option value="newest">Od najnowszych</option>
                  <option value="popular">Od najbardziej lubianych</option>
                </select>

                <button className="save-filters-button" onClick={applyFilters}>
                  Szukaj
                </button>
              </div>
            </>
          )}
        </div>

        {/* ---------- MAIN ---------- */}
        <div className="main-content">
          {showCreateForm ? (
            <CreateTripPostSection
              onCancel   ={()=>setShowCreateForm(false)}
              onSubmit   ={handleCreateTripPost}
            />
          ) : (
            <div className="posts-container">
              {filteredTripPosts.map(post => (
                <TripPostCard
                  key           ={post.id}
                  post          ={post}
                  likes         ={likeCounts[post.id] ?? 0}
                  likedByMe     ={post.likedByCurrentUser ?? false}
                  onClick       ={()=>setSelectedPost(post)}
                  onCommentClick={()=>{
                    setSelectedPost(post);
                    setScrollToComment(true);
                  }}
                  onUpdateLikes = {updatePostLike}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---------- MODAL ---------- */}
      {selectedPost && (
        <TripPostModal
          post          ={selectedPost}
          onClose       ={()=>setSelectedPost(null)}
          onUpdateLikes ={updatePostLike}
        />
      )}
    </>
  );
};

export default TripsPage;
