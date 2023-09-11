import { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Badge, Button, Pagination } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";

import axios from "axios";
import "./App.css";

function App() {
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState("");
  const [paginate, setPaginate] = useState([]);
  const [page, setPage] = useState(1);
  const [Sort, setSort] = useState("");
  const [flag, setFlag] = useState(false);
  const [error, setError] = useState("");
  const getCoins = async () => {
    try {
      setFlag(true);

      const { data } = await axios(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false"
      );
      setCoins(data);
      setFlag(false);
      setError("");
      //وقتی دیتا را با موفقیت گرفتیم باید ارور خالی بشه تا فالس شه و شزطش و اجرا نکنه
      //اگر خالی نشه حتی وقتی ما دیتا را با موفقیت گرفتیم باز شرط و اجرا میکنه چون فالس نیست
      const help = [];
      for (let i = 0; i < data.length / 10; i++) {
        help.push(i + 1);
      }
      setPaginate(help);
    } catch (error) {
      setFlag(false);
      setError(error.message);
    }
  };
  //چون فیلتر را وقتی نیاز داریم که میخواهیم سرچ کنیم،پس درمواقع دیگر نباید اجرا بشه،به همین دلیل داخل یوز ممو مینویسیم که فقط با تغییر سرچ اجرا بشه
  const result = useMemo(() => {
    return coins.filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.symbol.toLowerCase().includes(search.toLowerCase())
    );
  }, [coins, search]);
  //چون قبل از دریافت دیتا این یوزممو یکبار اجرا میشه و چون هنوز دیتا و نگرفتیم
  //کوینز یک ارایه ی خالیه،پس به ما هیچی نشون نمیده.به هیمن دلیل باید به عنوان دیپندنسی یوز ممو قرارش بدیم که با گرفتن دیتا دوباره یوز ممو اجرا بشه
  //ناچاریم برای یکبار فیلتر و اجرا کنیم تتا دیتا گرفته بشه
  //اگر همین کاری که بایوز مموکردیمو بخوایم بنویسیم باید چطوری بنویسیم؟
  //نیاز به یک استیت داریم
  //const [result,setResult]=useState([])
  //useEffect(() => {
  //   setResult(coins.filter(
  //     (item) =>
  //     item.name.toLowerCase().includes(search.toLowerCase()) ||
  //     item.symbol.toLowerCase().includes(search.toLowerCase())
  // ));
  // }, [coins,search]);
  useEffect(() => {
    getCoins();
  }, []);

  return (
    <div className="App">
      { flag ? (
        <div className="cen">
          <Button variant="primary" disabled>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            <span className="visually-hidden">Loading...</span>
          </Button>
        </div>
      ) : error ? (
        <div className="cen">
          <h1>
            <Badge bg="danger">{ error }</Badge>
          </h1>
        </div>
      ) : (
        <div>
          <div
            style={ {
              display: "flex",
              justifyContent: "center",
              margin: "1rem 0",
              gap: "1rem",
            } }
          >
            <div
              style={ {
                border: "1px solid black",
                width: "15rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.25rem 1rem",
                borderRadius: "0.25rem",
              } }
            >
              <input
                type="text"
                style={ { outline: "none", border: "none" } }
                onChange={ (e) => setSearch(e.target.value) }
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                style={ { width: "1.25rem", height: "1.25rem" } }
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <select onChange={ (e) => setSort(e.target.value) }>
              <option>market cap rank</option>
              <option>highest</option>
              <option>lowest</option>
              <option>A-Z</option>
              <option>Z-A</option>
            </select>
          </div>
          <div
            style={ {
              display: "grid",
              gridTemplateColumns: "repeat(5,15%)",
              justifyItems: "center",
              justifyContent: "space-around",
              alignItems: "center",
              width: "75%",
              margin: "0 auto",
              backgroundColor: "#efefef",
              borderRadius: "1rem",
              marginBottom: "2.5rem",
              padding: "1rem 0",
              fontSize: "1.25rem",
            } }
          >
            <p>market cap rank</p>
            <p>logo</p>
            <p>symbol</p>
            <p>name</p>
            <p>current price</p>
          </div>
          { result
            .sort((x, y) => {
              switch (Sort) {
                case "highest":
                  return y.current_price - x.current_price;
                case "lowest":
                  return x.current_price - y.current_price;

                case "A-Z":
                  return x.name.localeCompare(y.name);
                case "Z-A":
                  return y.name.localeCompare(x.name);
                case "market cap rank":
                  return x.market_cap_rank - y.market_cap_rank;
              }
            })
            .slice((page - 1) * 10, page * 10)
            .map((item) => {
              return (
                <div
                  key={ item.id }
                  style={ {
                    display: "grid",
                    gridTemplateColumns: "repeat(5,15%)",
                    justifyItems: "center",
                    justifyContent: "space-around",
                    alignItems: "center",
                    width: "75%",
                    margin: "0 auto",
                    backgroundColor: "#efefef",
                    borderRadius: "1rem",
                    marginBottom: "2.5rem",
                    padding: "0.5rem 0",
                    fontSize: "1.25rem",
                  } }
                >
                  <p>{ item.market_cap_rank }</p>
                  <img
                    src={ item.image }
                    style={ { width: "7.5rem", height: "7.5rem" } }
                  />
                  <p>{ item.symbol }</p>
                  <p>{ item.name }</p>
                  <p>$ { item.current_price }</p>
                </div>
              );
            }) }

          <div style={ { display: "flex", justifyContent: "center" } }>
            <Pagination size="lg">
              <Pagination.First onClick={ () => setPage(1) } />
              <Pagination.Prev
                onClick={ () => {
                  if (page > 1) {
                    setPage((l) => l - 1);
                  }
                } }
              />
              { paginate.map((item) => (
                <Pagination.Item
                  active={ item === page }
                  key={ item }
                  onClick={ () => setPage(item) }
                >
                  { item }
                </Pagination.Item>
              )) }
              <Pagination.Next
                onClick={ () => {
                  if (page < paginate.length) {
                    setPage((l) => l + 1);
                  }
                } }
              />
              <Pagination.Last onClick={ () => setPage(paginate.length) } />
            </Pagination>
          </div>
        </div>
      ) }
    </div>
  );
}

export default App;
