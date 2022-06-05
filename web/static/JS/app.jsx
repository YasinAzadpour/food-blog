const Link = ReactRouterDOM.Link;
const Route = ReactRouterDOM.Route;
const Router = ReactRouterDOM.BrowserRouter;
const Switch = ReactRouterDOM.Switch;
const useParams = ReactRouterDOM.useParams;
const useContext = React.useContext;
const useState = React.useState;
const useEffect = React.useEffect;
const createContext = React.createContext;


const getHomeData = (ctext, all=false) =>{
  const [data, setData] = ctext;
  $.ajax({
    method: "POST",
    url: "/api/home",
    data: {csrfmiddlewaretoken: data.csrfmiddlewaretoken, all: all},
    success: (r) => {
      r["csrfmiddlewaretoken"] = token;
      setData({...r,['isReady']:true});
    },
    error: () => {
      showMsg("An unknown nerwoek error has occurred");
      setTimeout(getAbout, 10000);
    },
  });
}

const showMsg = (message, t = 5000) => {
  const container = $("#msgContainer");
  const msg = $("#msgContainer #msg");
  msg.text(message);
  container.removeClass("opacity-0 pointer-events-none");

  setTimeout(() => {
    container.addClass("opacity-0 pointer-events-none");
    msg.text("");
  }, t);
};

const getMyInfo = (ctext) => {
  const [data, setData] = ctext;
  $.ajax({
    method: "POST",
    url: "/api/me",
    data: { csrfmiddlewaretoken: data.csrfmiddlewaretoken },
    success: (r) => {
      setData({ ...data, ["me"]: r.me||{} });
    },
    error: () => {
      showMsg("An unknown nerwoek error has occurred");
      setTimeout(getMyInfo, 10000);
    },
  });
};

const Auth = ({ page }) => {
  const [data, setData] = useContext(Context).data;

  const about = {
    "Sign-in": {
      url: "/accounts/sign-in",
      help: "create new account",
      helpurl: "/accounts/sign-up",
      about: "",
      apiurl: "/api/accounts/sign-in",
    },
    "Sign-up": {
      url: "/accounts/sign-up",
      help: "already have account",
      helpurl: "/accounts/sign-in",
      about: "",
      apiurl: "/api/accounts/sign-up",
    },
    "Get-Token": {
      help: "resend it",
      about: "We send a message with a digital code.",
      apiurl: "/api/accounts/get-token",
    },
  };
  const [formData, setFormData] = useState({
    csrfmiddlewaretoken: data.csrfmiddlewaretoken,
  });
  const [status, setStatus] = useState(page);
  const [isLoading, setIsLoading] = useState(false);
  const year = new Date().getFullYear();
  const [messages, setMessages] = useState({});
  const [codeTimeOut, setCodeTimeOut] = useState(60);

  const manageData = (e) => {
    setMessages({});
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (status == "Get-Token") {
      let time = setInterval(() => {
        if (codeTimeOut > 0) {
          setCodeTimeOut(codeTimeOut - 1);
        }
      }, 1000);
      return () => {
        clearInterval(time);
      };
    }
  });

  const hanldeClickHelpBtn = () => {
    setIsLoading(false);
    setMessages({});
    if (status == "Sign-up") {
      setStatus("Sign-in");
    } else if (status == "Sign-in") {
      setStatus("Sign-up");
    } else if (status == "Get-Token" && codeTimeOut == 0) {
      $.ajax({
        method: "POST",
        url: "/api/accounts/resend-token",
        data: formData,
        success: () => {
          setCodeTimeOut(60);
        },
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessages({});
    if (status === "Sign-up") {
      setIsLoading(true);
      $.ajax({
        method: "POST",
        url: about["Sign-up"]["apiurl"],
        data: formData,
        success: (r) => {
          setIsLoading(false);
          if (r.result == "ok") {
            setStatus("Get-Token");
          }
          setMessages(r);
        },
      });
    } else if (status === "Sign-in") {
      setIsLoading(true);
      $.ajax({
        method: "POST",
        url: about["Sign-in"]["apiurl"],
        data: formData,
        success: (r) => {
          setIsLoading(false);
          setMessages(r);
          if (r.result == "ok") {
            setStatus("Get-Token");
          }
        },
      });
    } else if (status === "Get-Token") {
      setIsLoading(true);
      $.ajax({
        method: "POST",
        url: about["Get-Token"]["apiurl"],
        data: formData,
        success: (r) => {
          setIsLoading(false);
          setMessages(r);
          if (r.result == "ok") {
            document.location = "/";
          }
        },
      });
    }
  };

  return (
    <main className="flex flex-col justify-center items-center w-full h-[100vh] relative">
      <form
        className="rounded-xl border-slate-200 border-[1px] sm:border-2 p-6 m-6 flex items-center max-w-[30rem] flex-col justify-center relative"
        method="post"
        onSubmit={handleSubmit}
      >
        <h1 className="text-xl font-medium">{status}</h1>
        {about[status]["about"] && (
          <p className="p2-1 pb-2 text-slate-600">{about[status]["about"]}</p>
        )}
        {status == "Sign-up" && (
          <div className="py-2 my-2 text-lg flex flex-col">
            <input
              className="bg-gray-100 p-2 rounded-lg placeholder:text-gray-600 w-full"
              type="text"
              maxLength="50"
              name="name"
              placeholder="Name"
              onChange={manageData}
              required={true}
            />
            <span
              className={`text-sm text-red-500 pt-1 ${
                messages.name ? "opacity-100" : ""
              }`}
            >
              {messages.name || ""}
            </span>
          </div>
        )}

        {(status == "Sign-up" || status == "Sign-in") && (
          <div className="py-2 my-2 text-lg flex flex-col">
            <input
              className="bg-gray-100 p-2 rounded-lg placeholder:text-gray-600 w-full"
              type="tel"
              name="phone"
              placeholder="Phone"
              onChange={manageData}
              required={true}
            />
            <span
              className={`text-sm text-red-500 pt-1 ${
                messages.phone ? "opacity-100" : ""
              }`}
            >
              {messages.phone || ""}
            </span>
          </div>
        )}
        {status == "Get-Token" && (
          <div className="py-2 my-2 text-lg flex flex-col">
            <input
              className="text-2xl w-[20ch] bg-gray-100 p-2 rounded-lg placeholder:text-gray-600 text-center"
              type="text"
              maxLength="10"
              name="code"
              placeholder="Code"
              onChange={manageData}
              required={true}
            />
            <span
              className={`text-sm text-red-500 pt-1 ${
                messages.code ? "opacity-100" : ""
              }`}
            >
              {messages.code || ""}
            </span>
          </div>
        )}
        {status != "Get-Token" && (
          <div className="py-2 my-2 text-lg flex flex-col">
            <input
              className="bg-gray-100 p-2 rounded-lg placeholder:text-gray-600 w-full"
              type="password"
              name="password"
              placeholder="Password"
              pattern={status === "Sign-up" ? ".{8,}" : ".*"}
              onChange={manageData}
              required={true}
            />
            <span
              className={`text-sm text-red-500 pt-1 ${
                messages.password ? "opacity-100" : ""
              }`}
            >
              {messages.password ||
                (status == "Sign-up" ? "This password is too short." : "")}
            </span>
          </div>
        )}

        <button
          type="submit"
          className={`p-4 w-full m-0 rounded-full bg-green-700 text-white active:scale-[0.98] transition-all flex items-center justify-center ${
            isLoading ? "opacity-75" : ""
          }`}
        >
          {status == "Get-Token" ? "Send" : status.replace(/\W+/g, "")}
          {isLoading ? "..." : ""}
        </button>
        <Link
          onClick={hanldeClickHelpBtn}
          to={about[status]["helpurl"]}
          className={`w-full text-center pt-4 text-green-600 hover:text-green-500 ${
            codeTimeOut > 0 && status == "Get-Token"
              ? "opacity-75 cursor-default"
              : " cursor-pointer"
          }`}
        >
          {about[status]["help"]}
          {codeTimeOut > 0 && status == "Get-Token" && ` (${codeTimeOut})`}
        </Link>
      </form>

    </main>
  );
};

const FooterSection = () => {
  const validUrl = ["instagram", "twitter", "github", "facebook", "linkedin"];
  const year = new Date().getFullYear();
  const [data, setData] = useContext(Context).data;
  if (data.isReady){
    return (
      <footer className="w-full text-sm flex items-center justify-around py-10 flex-col-reverse md:flex-row">
        <span className="font-normal text-slate-600 my-2">
          {`© chef ${year}. All right reserved.`}
        </span>
        {data.tel ? (
          <p className="text-slate-600 my-2">
            Tel: <a href={`tel:${data.tel}`}>{data.tel}</a>
          </p>
        ) : (
          ""
        )}
        {data.links.length ? (
          <p className="text-slate-600 my-2">
            {data.links.map((link) => (
              <a
                target="_blank"
                title={link.name}
                href={link.url}
                className="p-1 cursor-pointer"
                key={link.id}
              >
                <i
                  className={`bi bi-${
                    validUrl.includes(link.name) ? link.name : "link-45deg"
                  }`}
                ></i>
              </a>
            ))}
          </p>
        ) : (
          ""
        )}
      </footer>
    );}else {
      return ("");
    }
};

const HeaderSection = () => {
  const [isShow, setIsShow] = useState(false);
  const [data, setData] = useContext(Context).data;
  if(data.isReady){
  return (
    <header
      className={`z-10 flex justify-between items-center flex-col fixed sm:flex-row top-0 w-full bg-white h-12 sm:h-16`}
    >
      <h1 className="text-xl p-2 sm:p-4 font-medium">
        <Link to="/">Chef</Link>
      </h1>
      <ul className={` bg-white items-center w-full h-auto flex-col flex sm:flex-row sm:bg-transparent sm:w-auto overflow-hidden absolute top-12 right-0 sm:top-0 ${
        isShow ? "h-auto" : "h-0 sm:h-auto"
      }`}>
        <li  className="w-full whitespace-nowrap hover:text-slate-700 cursor-pointer transition-all text-center">
          <Link onClick={()=>() => {setIsShow(false)}} to="/" className="p-4 block">
            Home
          </Link>
        </li>

        <li className="w-full whitespace-nowrap hover:text-slate-700 cursor-pointer transition-all text-center">
          <Link onClick={()=>() => setIsShow(false)} to="/about" className="p-4 block">
            About
          </Link>
        </li>

        {data.me.id ? (
          <li className="w-full whitespace-nowrap hover:text-slate-700 cursor-pointer transition-all text-center">
            <button onClick={()=>{setIsShow(false);setData({...data,['showCart']:true});$("body").addClass("overflow-hidden");}} className="p-4 inline-block">
              Cart
            </button>
          </li>
        ) : (
          ""
          )}
          {data.showCart&&data.me.id ? <MyCart /> : ""}
        {data.me.isSuperUser ? (
          <li  className="w-full whitespace-nowrap hover:text-slate-700 cursor-pointer transition-all text-center">
            <Link onClick={()=>() => setIsShow(false)} to="/admin-panel" className="p-4 block">
              Admin panel
            </Link>
          </li>
        ) : (
          ""
        )}

        {data.me.id ? (
          <li className="w-full">
            <Link  onClick={()=>() => setIsShow(false)} to="/me/settings" className="w-full flex items-center">
              <img
                src={data.me.profile}
                alt="Your profile image"
                className="overflow-hidden rounded-[33%] min-w-[3rem] w-[15%] m-2 aspect-square sm:w-[2.5rem] sm:min-w-[2.5rem] sm:h-[2.5rem]"
              />
              <div className="m-1 w-full overflow-hidden sm:w-0 sm:m-0 truncate">
                <span className="font-medium text-base">{data.me.name}</span>
                <br />
                <span className="font-light text-sm text-slate-600">
                  {data.me.phone}
                </span>
              </div>
            </Link>
          </li>
        ) : (
          <li  onClick={()=>() => setIsShow(false)} className="w-[90%] border-2 border-gray-700  m-2  cursor-pointer text-center rounded-full bg-gray-900 text-white">
            <Link to="/accounts/sign-in" className="py-2 px-6 block">
              Join
            </Link>
          </li>
        )}
      </ul>

      <div
        onClick={() => setIsShow(!isShow)}
        id="more"
        className={`cursor-pointer absolute right-0 top-0 m-1 sm:m-2 p-2 h-10 w-12 sm:w-0 sm:h-0 flex flex-col items-center justify-between text-slate-900 ${
          isShow ? "active" : ""
        }`}
      >
        <span className="w-full rounded-full h-[2px] bg-slate-900"></span>
        <span className="w-full rounded-full h-[2px] bg-slate-900"></span>
        <span className="w-full rounded-full h-[2px] bg-slate-900"></span>
      </div>
    </header>
  );}else {
    return ("");
  }
};

const MyCart = () => {
  const [data, setData] = useContext(Context).data;
  const [cart, setCart] = useState({});


  const [formData, setFormData] = useState({
    csrfmiddlewaretoken: data.csrfmiddlewaretoken,
    address: data.me.address,
    lat: data.me.lat,
    lng: data.me.lng,
  });

  const Mcard = ({ food }) => {
    const [foodCount, setFoodCount] = useState(food.quantity);
    const [data, setData] = useContext(Context).data;

    const buyRequest = (quantity) => {
      $.ajax({
        method: "POST",
        url: "/api/buy",
        data: {
          csrfmiddlewaretoken: data.csrfmiddlewaretoken,
          id: food.id,
          quantity: quantity,
        },
        success: (r) => {
          
          if (r.result == "ok") {
            setData({ ...data, ["cart"]: r.cart });
          }
        },
      });
    };

    const mCount = (e) => {
      if (!cart.paid) {
        if (e.target.name == "+" && foodCount < 100) {
          buyRequest(foodCount + 1);
          setFoodCount(foodCount + 1);
        } else if (e.target.name == "-") {
          if (foodCount - 1 == 0) {
            buyRequest(0);
          } else {
            buyRequest(foodCount - 1);
            setFoodCount(foodCount - 1);
          }
        }
      }
    };

    return (
      <div className="relative p-2 bg-white shadow-lg flex-col overflow-hidden rounded-xl m-2 card flex h-min">
        <div className={`w-full top-0 right-0 blur-2xl absolute h-full bg-[url(${food.image})] bg-center bg-cover brightness-75`}/>
        <div className="z-[2] flex flex-col h-full justify-between text-xl">
          <h1 dir="auto" className="my-1 font-medium underline truncate">
          <Link to={`/foods/${food.slug}`}>
            {food.name}
          </Link>
          </h1>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-800 mr-1 py-1">🔥 {food.cal}cal</span>

            <span className="font-meduim">${food.price}</span>
          </div>
          <div className="number flex justify-between items-center w-full my-2">
            <button
              name="-"
              onClick={mCount}
              className={
                "flex items-center justify-center rounded-full w-12 h-12 text-2xl active:scale-[0.98] transition-all " +
                (foodCount == 1
                  ? "bg-red-200 text-red-600 hover:bg-red-700 hover:text-white"
                  : "bg-green-200 text-green-600 hover:bg-green-700 hover:text-white")
              }
            >
              -
            </button>
            <span className="text-3xl text-center">{foodCount}</span>
            <button
              name="+"
              onClick={mCount}
              className="flex items-center justify-center bg-green-200 text-green-600 hover:bg-green-700 hover:text-white rounded-full w-12 h-12 text-2xl active:scale-[0.98] transition-all"
            >
              +
            </button>
          </div>
        </div>
      </div>
    );
  };

  const manageData = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const hanldeSubmit = (e) => {
    e.preventDefault();
    if (!cart.paid) {
      $.ajax({
        method: "POST",
        url: "/api/cart/pay",
        data: formData,
        success: (r) => {
          if (r.result) {
            setCart({...cart,['paid']:true})
          }
        },
      });
    }
  };

  const getMyCart = () =>{
    $.ajax({
      method: "POST",
      url: "/api/me/cart",
      data: {csrfmiddlewaretoken: data.csrfmiddlewaretoken,},
      success: (r) => {
        if (r.result) {
          setCart({ ...r.cart, ["isReady"]: true });
        }
      },
      error: () => {
        showMsg("An unknown nerwoek error has occurred");
        setTimeout(getMyCart, 10000);
      },
    });
  }
  useEffect(() => {
    getMyCart();
  }, [1]);

  const closeSide = (e) => {
    if (e.target.id == "close") {
      $("body").removeClass("overflow-hidden");
      setData({...data,['showCart']: false});
    }
  };
  return (
    <div
      id="close"
      onClick={closeSide}
      className={`bg-[#00000078] backdrop-blur-sm fixed w-screen h-screen right-0 top-0 flex flex-col-reverse sm:flex-row-reverse z-20 ${
        true ? "" : "opacity-0 pointer-events-none"
      }`}
    >
      {cart.isReady?
      <div
        className={`${
          true
            ? "translate-0"
            : "translate-y-[100%] sm:translate-x-[100%] sm:translate-y-0"
        } overflow-auto transition-all border-2 border-gray-100 flex flex-col bg-white absolute rounded-tr-3xl rounded-tl-3xl w-full h-[95%] sm:rounded-tr-none sm:rounded-bl-3xl sm:h-full sm:w-[28rem]`}
      >
        <button
          id="close"
          className="p-2 w-full flex items-center justify-center sm:w-auto sm:h-full sm:left-0 sm:absolute"
        >
          <div className="rounded-full bg-gray-200 w-20 h-1 sm:h-20 sm:w-1"></div>
        </button>
        <div className="h-full overflow-auto">
        {cart.items.map((item)=>(
          <Mcard food={item} key={item.id}/>
        ))}
        </div>
        <form onSubmit={hanldeSubmit} className="flex flex-col m-4 lg:ml-4">
          <div className="my-2 text-xl flex">
            <span className="text-semibold">Address: </span>
            <input
              type="text"
              className="text-slate-800 text-lg ml-2 w-full"
              defaultValue={data.me.address}
              name="address"
              onChange={manageData}
            />
          </div>
          <div className="flex justify-between items-start my-4 w-full text-xl">
            <span>Total Price:</span>
            <span className="text-gray-800">${cart.price}</span>
          </div>
          <button
            className={`py-4 px-8 w-full m-0 rounded-full text-white transition-all ${
              cart.paid ? "bg-gray-900" : "bg-green-700 active:scale-[0.98]"
            }`}
          >
            {cart.paid ? "Sending ..." : "Pay"}
          </button>
        </form>
      </div>
      :""}
    </div>
  );
};

const Card = ({ food, type = "mini" }) => {
  const [data, setData] = useContext(Context).data;
  const [liked, setLiked] = useState(food.liked);

  const handleLike = (e) => {
    $.ajax({
      method: "POST",
      url: "/api/like",
      data: { csrfmiddlewaretoken: data.csrfmiddlewaretoken, id: food.id },
      success: (r) => {
        if (r.result) {
          setLiked(!liked)
        }
      },
    });
  };

  if(type=="mini"){
    return (
      <div className="relative p-2 bg-white shadow-lg snap-start w-[30vw] min-w-[200px] max-w-[350px] flex-col overflow-hidden rounded-xl m-2 card flex h-full">
          <Link className="h-full flex flex-col" to={`/foods/${food.slug}`}>
            <div className="h-full flex w-full aspect-video items-center justify-center rounded-xl overflow-hidden">
              <img
                src={food.image}
                alt={`${food.name}'s image`}
                className="h-full"
              />
            </div>
            <div className="flex flex-col h-full justify-between">
              <h1 dir="auto" className="py-1 font-medium text-lg truncate">
                {food.name}
              </h1>
              <span className="text-gray-800 py-1">🔥 {food.cal}cal</span>
              <span className="font-meduim  py-1">${food.price}</span>
            </div>
          </Link>
          <i
            className={`bi cursor-pointer absolute bottom-0 right-0 py-2 px-3 active:scale-75  ${
                liked
                ? "bi-heart-fill text-red-600"
                : "bi-heart"
            }`}
            onClick={handleLike}
          ></i>
        </div>
    )
  }else {
    return (
<Link
          to={`/foods/${food.slug}`}
          className="first:ml-[10%] last:mr-[10%] snap-center mx-2 sm:mx-4 bg-cover bg-center w-[80%] min-w-[80%] aspect-video sm:max-h-[24rem] lg:max-h-[26rem] sm:h-auto flex items-end max-w-[90rem] justify-center rounded-xl relative overflow-hidden after:absolute after:h-1/3 after:w-full after:bg-gradient-to-t after:from-[#000000be] "
          style={{ backgroundImage: `url(${food.image})` }}
        >
          <span className="text-black p-1 rounded-full bg-[#ffffffbf] text-sm absolute right-0 top-0 m-1">
            🔥 {food.cal}cal
          </span>
          <div className="w-full z-[1] m-2 sm:m-6">
            <h1
              dir="auto"
              className="my-1 font-medium text-base sm:text-lg text-white truncate"
            >
              {food.name}
            </h1>
            <p
              dir="auto"
              className="text-slate-200 py-1 text-sm sm:text-base truncate"
            >
              {food.about}
            </p>
          </div>
        </Link>
    )
  }
};

const Feedbacks = ({ feedbacks }) => {
  return (
    <div className="container flex-col flex items-center justify-center py-12 px-6">
      <h1 className="font-medium text-3xl">What our customers are saying</h1>
      <div className="py-4 flex items-center overflow-auto w-full">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="relative p-2 bg-white shadow-lg  h-[200px] w-[300px] min-w-[250px] flex-col overflow-hidden rounded-xl m-4 flex ">
            <div className="flex flex-col h-full justify-between">
              <p dir="auto" className="text-gray-700 p-2 my-1 text-sm ">
                {feedback.text}
              </p>
              <div className="w-full flex items-center">
                <img
                  src={feedback.user__profile}
                  alt={`${feedback.user__name}'s profile`}
                  className="overflow-hidden rounded-[33%] min-w-[3rem] w-[15%] m-2 ml-0 aspect-square sm:w-[2.5rem] sm:min-w-[2.5rem] sm:h-[2.5rem]"
                />
                <div className="font-medium text-lg m-1 ">
                  <h1>{feedback.user__name}</h1>
                  <div className="flex w-full justify-center text-yellow-500 text-sm">
                    <i className={`bi bi-star-fill py-2 px-1`}></i>
                    <i
                      className={`bi bi-star${
                        feedback.stars >= 2 ? "-fill" : ""
                      } py-2 px-1`}
                    ></i>
                    <i
                      className={`bi bi-star${
                        feedback.stars >= 3 ? "-fill" : ""
                      } py-2 px-1`}
                    ></i>
                    <i
                      className={`bi bi-star${
                        feedback.stars >= 4 ? "-fill" : ""
                      } py-2 px-1`}
                    ></i>
                    <i
                      className={`bi bi-star${
                        feedback.stars >= 5 ? "-fill" : ""
                      } py-2 px-1`}
                    ></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Reccomendeds = ({ items = [], id = "" }) => {

  return (
    <div className="container overflow-x-auto relative after:h-full after:w-[10%] after:absolute after:left-0 after:top-0 after:bg-gradient-to-r after:from-white before:h-full before:w-[10%] before:absolute before:right-0 before:top-0 before:bg-gradient-to-l before:from-white before:z-[2]">
      <div
        id={id}
        className="no-scrollbar flex overflow-x-auto"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {items.map((p) => (
          <Card food={p} key={p.id} type="main" />
        ))}
      </div>
    </div>
  );
};

const Category = ({ title, foods, id }) => {
  const [items, setItems] = useState({items:foods, hasNext: true});
  
  const getItems = () =>{
    if (items.hasNext){

    }
  }
  
   useEffect(() => {
     const lastChild = document.querySelector(`.cat-${id} > *:last-child`);

     const observer = new IntersectionObserver((entries) => {
       entries.forEach((entry) => {
         if (entry.isIntersecting) {
          //  TODO
           getItems();
         }
       });
     });
     if (lastChild) {
       observer.observe(lastChild);
     }
   }, [items]);

  return (

    <div className="container p-4 flex-col flex items-start max-w-[90rem]">
      <h1 className="text-xl m-2">{title}</h1>
      <div
        id={`#cat-${id}`}
        className={`cat-${id} pb-4 flex items-center overflow-x-auto overflow-y-hidden w-full`}
        style={{ scrollSnapType: "x mandatory" }}
      >
        {items.items.map((food) => (
          <Card food={food} key={food.id} />
        ))}
      </div>
    </div>
  );
};

const BuySection = () => {
  const [food, setFood] = useState({ quantity: 1 });
  const [paid, setPaid] = useState(false);
  const [is404, setIs404] = useState(false);
  const [data, setData] = useContext(Context).data;
  
  const url = useParams();

  const buyIt = () => {
    if (data.me.id) {
      $.ajax({
        method: "POST",
        url: "/api/buy",
        data: {
          csrfmiddlewaretoken: data.csrfmiddlewaretoken,
          id: food.id,
          quantity: food.quantity,
        },
        success: (r) => {
          
          if (r.result) {
            setPaid(true)
          }
        },
        error: () => {
          showMsg("An unknown nerwoek error has occurred");
          setTimeout(buyIt, 10000);
        },
      });
    }else{
      showMsg("Please login")
    }
  };
  const getFood = () => {
    $.ajax({
      method: "POST",
      url: `/api/foods/${url.slug}`,
      data: { csrfmiddlewaretoken: data.csrfmiddlewaretoken },
      success: (r) => {
        
        if (r.result) {
          setPaid(r.paid);
          r["quantity"] = r.quantity || 1;
          setFood({ ...r, ["isReady"]: true });
        }
      },
      error: (xhr) => {
        if (xhr.status != 404){
        showMsg("An unknown nerwoek error has occurred");
        setTimeout(getFood, 10000);
      }
      },
      statusCode: {
        404: ()=>{
          setIs404(true);
        }
      }
    });
  };

  useEffect(() => {
    getFood();
    getHomeData([data, setData]);
  }, [1]);

  const mCount = (e) => {
    setPaid(false);
    if (e.target.name == "+" && food.quantity < 100) {
      setFood({ ...food, ["quantity"]: food.quantity + 1 });
    }
    if (e.target.name == "-" && 1 < food.quantity) {
      setFood({ ...food, ["quantity"]: food.quantity - 1 });
    }
  };

  return (
    <main className="flex w-full flex-col items-center mt-20">

      {is404?<Page404 />:food.isReady ? (
        <div className="container p-10 flex items-center max-w-[50rem] flex-col justify-center relative">
          <div className="rounded-xl w-full aspect-video sm:min-w-fit sm:max-w-fit flex items-center justify-center overflow-hidden">
            <img
              src={food.image}
              alt={`${food.name}'s image`}
              className="h-full"
            />
          </div>
          <div className="flex justify-between flex-col w-full">
            <h1 dir="auto" className="my-4 font-medium text-lg">
              {food.name}
            </h1>
            <p
              dir="auto"
              className="my-1 whitespace-normal font-light truncate overflow-hidden"
            >
              {food.about}
            </p>
            <div className="flex justify-between items-center my-4 w-full text-lg">
              <span className="text-gray-800 mr-1 py-1">🔥 {food.cal}cal</span>
              <span className="text-gray-800">${food.price}</span>
            </div>

            <div className="number flex justify-between items-center w-full my-4">
              <button
                name="-"
                onClick={mCount}
                className="flex items-center justify-center bg-green-200 text-green-600 hover:bg-green-700 hover:text-white rounded-full w-12 h-12 text-2xl active:scale-[0.98] transition-all"
              >
                -
              </button>
              <span className="text-3xl text-center">{food.quantity}</span>
              <button
                name="+"
                onClick={mCount}
                className="flex items-center justify-center bg-green-200 text-green-600 hover:bg-green-700 hover:text-white rounded-full w-12 h-12 text-2xl active:scale-[0.98] transition-all"
              >
                +
              </button>
            </div>
            <button
              onClick={()=>{paid?(setData({...data,['showCart']: true})):buyIt()}}
              className={`w-full m-0 rounded-full text-white active:scale-[0.98] transition-all py-4 px-8 ${
                paid ? "bg-gray-900" : "bg-green-700"
              }`}
            >
              {paid ? (
                  "Show Cart"
              ) : (
                  "Add to cart"
              )}
            </button>
          </div>
        </div>
      ) : (
        ""
      )}

    </main>
  );
};

const Home = ({}) => {
  const [data, setData] = useContext(Context).data;
  const [sendFeedback, setSendFeedback] = useState(false);
  

  useEffect(() => {
    getHomeData([data, setData],true);
  }, [1]);

  const WriteFeedback = () => {
    const [stars, setStars] = useState(1);
    const [text, setText] = useState("");

    const send = (e) => {
      e.preventDefault();
      $.ajax({
        method: "POST",
        url: "/api/feedbacks/send",
        data: {
          csrfmiddlewaretoken: data.csrfmiddlewaretoken,
          text: text,
          stars: stars,
        },
        success: (r) => {
          if (r.result == "ok") {
            setSendFeedback(false);
          }
        },
      });
    };

    return (
      <div
        id="close"
        onClick={(e) => {
          e.target.id == "close" ? setSendFeedback(false) : "";
        }}
        className={`bg-[#00000080] backdrop-blur-lg flex items-center justify-center w-full h-full z-[1000] fixed top-0 left-0`}
      >
        <form
          onSubmit={send}
          className={`min-w-[250px] mx-4 flex flex-col bg-white rounded-xl max-w-[40rem] shadow-xl`}
        >
          <input
            required={true}
            placeholder="Write..."
            maxLength="200"
            onChange={(e) => setText(e.target.value)}
            name="text"
            className="overflow-hidden m-4 focus:border-0 focus:outline-0 min-w-[250px]  bg-transparent"
          />
          <div className="flex w-full justify-center text-yellow-500 ">
            <i
              onClick={() => setStars(1)}
              className={`bi bi-star-fill py-2 px-1 cursor-pointer `}
            ></i>
            <i
              onClick={() => setStars(2)}
              className={`bi bi-star${
                stars >= 2 ? "-fill" : ""
              } py-2 px-1 cursor-pointer `}
            ></i>
            <i
              onClick={() => setStars(3)}
              className={`bi bi-star${
                stars >= 3 ? "-fill" : ""
              } py-2 px-1 cursor-pointer `}
            ></i>
            <i
              onClick={() => setStars(4)}
              className={`bi bi-star${
                stars >= 4 ? "-fill" : ""
              } py-2 px-1 cursor-pointer `}
            ></i>
            <i
              onClick={() => setStars(5)}
              className={`bi bi-star${
                stars >= 5 ? "-fill" : ""
              } py-2 px-1 cursor-pointer `}
            ></i>
          </div>
          <div className="flex">
            <button
              type="submit"
              className="p-3 w-full border-t-t border-gray-100"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (data.isReady){
  return (
    <main className="flex w-full flex-col items-center mt-20">


      <Reccomendeds items={data.reccomendeds.slice(0, 7)} id="rec-1" />
      {data.foods
        .slice(0, 4)
        .map((group) =>
          group.foods.length ? (
            <Category title={group.title} foods={group.foods} id={group.id} key={group.id} />
          ) : (
            ""
          )
        )}

      {data.feedbacks.length ? <Feedbacks feedbacks={data.feedbacks} /> : ""}

      {data.foods
        .slice(4, 6)
        .map((group) =>
          group.foods.length ? (
            <Category title={group.title} foods={group.foods} id={group.id} key={group.id} />
          ) : (
            ""
          )
        )}

      <Reccomendeds items={data.reccomendeds.slice(7)} id="rec-2" />

      {data.foods
        .slice(6, 10)
        .map((group) =>
          group.foods.length ? (
            <Category title={group.title} foods={group.foods} id={group.id} key={group.id} />
          ) : (
            ""
          )
        )}

      {data.me.id ? (
        <button
          onClick={() => setSendFeedback(true)}
          className="py-4 px-8 border-[1px] sm:border-2 border-slate-200 bg-green-200 text-green-700 rounded-full "
        >
          Write your feedback
        </button>
      ) : (
        ""
      )}

      {sendFeedback ? <WriteFeedback /> : ""}


    </main>
  );}else {
    return (
      ""
    )
  }
};

const About = ({}) => {
  const [data, setData] = useContext(Context).data;
  const [about, setAbout] = useState({});

  const getAbout = () => {
    $.ajax({
      method: "POST",
      url: "/api/about",
      data: { csrfmiddlewaretoken: data.csrfmiddlewaretoken },
      success: (r) => {
        if (r.result) {
          setAbout({ ...r, ["isReady"]: true });
        }
      },
      error: () => {
        showMsg("An unknown nerwoek error has occurred");
        setTimeout(getAbout, 10000);
      },
    });
  };

  useEffect(() => {
    getHomeData([data, setData]);
    getAbout();
  }, [1]);

  return (
    <main className="flex w-full flex-col items-center mt-20">

      {about.isReady ? (
        <div className="container p-10 flex items-center max-w-[60rem] flex-col justify-center">
          <div className="rounded-xl w-full aspect-video  flex items-center justify-center overflow-hidden">
            <img
              src={about.image}
              alt={`${about.title}'s image`}
              className="h-full"
            />
          </div>
          <article className="flex justify-between flex-col h-full w-full">
            <ReactMarkdown
              source={'# '+about.title+ ' \n'+ about.text}
              className="my-1  whitespace-normal"
              dir="auto"
            />
          </article>
        </div>
      ) : (
        ""
      )}

    </main>
  );
};

const SettingsView = ({}) => {
  const [data, setData] = useContext(Context).data;
  const [editField, setEditField] = useState(null);
  const [messages, setMessages] = useState({});
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSide, setShowSide] = useState(null);

  useEffect(() => {
    getMyInfo([data, setData]);
  }, [1]);

  const Container = ({ sideName, title, about, btn, func }) => {
    const [pass, setPass] = useState("");

    const deleteAccount = () => {
      $.ajax({
        method: "POST",
        url: "/api/accounts/delete",
        data: { csrfmiddlewaretoken: data.csrfmiddlewaretoken, password: pass },
        success: (r) => {
          if (r.result) {
            document.location = "/";
          } else {
            setMessages(r);
          }
        },
        error: () => {
          setShowSide(null);
          showMsg("An unknown nerwoek error has occurred");
        },
      });
    };
    return (
      <div
        id="close"
        onClick={closeSide}
        className={`${
          showSide == sideName
            ? "bg-[#00000078]"
            : "pointer-events-none opacity-0"
        } fixed flex h-screen items-center justify-center right-0 top-0 w-screen z-20 transition-all backdrop-blur-sm`}
      >
        <div
          className={`bg-white rounded-xl w-2/3 max-w-lg transition-all ${
            !showSide == sideName ? "scale-75 opacity-0" : ""
          }`}
        >
          <h1 className="text-xl px-6 pt-4">{title}</h1>
          <p className="px-6 py-4 text-gray-700">{about}</p>

          {showSide == "delete" ? (
            <div className="w-full my-1 text-lg flex flex-col px-6 py-2">
              <input
                className="border-gray-300 border-b-2 py-1 placeholder:text-gray-600 w-full focus:border-gray-500 focus:placeholder:text-gray-700"
                type="password"
                name="password"
                placeholder="Current password"
                onChange={(e) => setPass(e.target.value)}
                required={true}
              />
              <span
                className={`text-sm text-red-500 pt-1 ${
                  messages.password ? "opacity-100" : "opacity-0"
                }`}
              >
                {messages.password}
              </span>
            </div>
          ) : (
            ""
          )}

          <div className="flex flex-col">
            <button
              onClick={showSide == "delete" ? deleteAccount : func}
              className="border-t-2 border-t-gray-100 p-3 text-red-500"
            >
              {btn}
            </button>
            <button
              id="close"
              onClick={closeSide}
              className="border-t-2 border-t-gray-100 p-3"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const manageForm = (e) => {
    if (e.target.name == "profile") {
      showMsg("Processing...");
      const [file] = e.target.files;
      setIsLoading(true);
      const pyload = new FormData();
      pyload.append("profile", file);
      pyload.append("csrfmiddlewaretoken", data.csrfmiddlewaretoken);
      $.ajax({
        method: "POST",
        url: "/api/me/edit",
        data: pyload,
        contentType: false,
        processData: false,
        success: (r) => {
          if (r.result) {
            setData({ ...data, ["me"]: r.me });
            setIsLoading(false);
            setEditField(null);
            setFormData({});
          } else {
            showMsg(r.profile || "Server error");
          }
        },
        error: () => {
          showMsg("An unknown nerwoek error has occurred");
        },
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    if (e.target.name == "password2" && formData.password1 != e.target.value) {
      setMessages({ ...messages, ["password"]: "passwords don't match." });
    } else {
      setMessages({ ...messages, ["password"]: null });
    }
  };

  const killAll = () => {
    $.ajax({
      method: "POST",
      url: "/api/accounts/kill-other",
      data: { csrfmiddlewaretoken: data.csrfmiddlewaretoken },
      success: (r) => {
        setShowSide(null);
        if (r.result) {
          showMsg("Successfully killed");
        } else {
          showMsg("Server error");
        }
      },
      error: () => {
        setShowSide(null);
        showMsg("An unknown nerwoek error has occurred");
      },
    });
  };

  const signOut = () => {
    $.ajax({
      method: "POST",
      url: "/api/accounts/log-out",
      data: { csrfmiddlewaretoken: data.csrfmiddlewaretoken },
      success: (r) => {
        setIsLoading(false);
        if (r.result) {
          document.location = "/";
        } else {
          setMessages(r);
        }
      },
      error: () => {
        setShowSide(null);
        showMsg("An unknown nerwoek error has occurred");
      },
    });
  };

  const closeSide = (e) => {
    if (e.target.id == "close") {
      setShowSide(null);
      setMessages({});
      setIsLoading(false);
      setEditField(null);
    }
  };

  const changePassword = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const pyload = formData;
    pyload["csrfmiddlewaretoken"] = data.csrfmiddlewaretoken;
    $.ajax({
      method: "POST",
      url: "/api/accounts/change-password",
      data: pyload,
      success: (r) => {
        setIsLoading(false);
        if (r.result) {
          setData({ ...data, ["csrfmiddlewaretoken"]: r.csrfmiddlewaretoken });
          setShowSide(null);
          setFormData({});
          showMsg("Password successfully changed.");
        } else {
          setMessages(r);
        }
      },
      error: () => {
        setShowSide(null);
        setFormData({});
        showMsg("An unknown nerwoek error has occurred");
      },
    });
  };

  const save = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const pyload = formData;
    pyload["csrfmiddlewaretoken"] = data.csrfmiddlewaretoken;
    $.ajax({
      method: "POST",
      url: "/api/me/edit",
      data: pyload,
      success: (r) => {
        setIsLoading(false);
        if (r.result) {
          setData({ ...data, ["me"]: r.me });
          setEditField(null);
          setFormData({});
          showMsg("Successfully changed");
        }
        setMessages(r);
      },
      error: () => {
        setIsLoading(false);
        setEditField(null);
        setFormData({});
        showMsg("An unknown nerwoek error has occurred");
      },
    });
  };

  return (
    <main className="mt-10 flex items-center justify-center flex-col">

      {data.me.id ? (
        <section className="p-6 max-w-6xl w-full">
          <h1 className="text-3xl border-b-2 border-gray-300 mb-4 py-2">
            About you
          </h1>
          <div className="flex justify-between mb-6">
            <div className="w-3/4">
              <h2 className="py-1 text-xl">Photo</h2>
              <p className="py-1 text-gray-700">
                Your photo apears on your Profile page and with your posts
                across Backslash.
              </p>
              <p className="py-1 text-gray-700">
                Reccomened size: Square, at least 1000 pixels per side. File
                type: JPG, PNG or GIF
              </p>
            </div>
            <div className="relative group flex items-center justify-center">
              <input
                name="profile"
                type="file"
                name="profile"
                onChange={manageForm}
                className="w-full h-full absolute cursor-pointer opacity-0 z-[2]"
                title="Click to change profile image"
              />
              <img
                src={data.me.profile}
                alt={`${data.me.name}'s image`}
                className="w-[6rem] sm:w-[7rem] aspect-square rounded-full group-hover:brightness-75"
              />
              <div className="absolute w-5 h-5 rounded-full flex items-center justify-center bg-[#0000001a] opacity-75 group-hover:opacity-100 group-hover:scale-105">
                <i className="bi bi-pencil absolute text-white"></i>
              </div>
            </div>
          </div>

          <form onSubmit={save} className="flex justify-between mb-6 relative">
            <div className="w-3/4">
              <h2 className="py-1 text-xl">Username</h2>
              {editField == "phone" ? (
                <input
                  defaultValue={data.me.phone}
                  type="phone"
                  name="phone"
                  placeholder="Phone"
                  onChange={manageForm}
                  className="py-1 border-b-2 border-gray-300 w-full focus:border-gray-500"
                  disabled={!(editField == "phone")}
                />
              ) : (
                <span className="py-1 border-b-2 border-gray-300 w-full block">
                  {data.me.phone}
                </span>
              )}
              <span
                className={`text-red-500 text-sm ${
                  messages.phone ? "opacity-100" : "opacity-0"
                }`}
              >
                {messages.phone || "Invalid phone number."}
              </span>
              <p className="text-gray-700">Your account identifire</p>
            </div>
            <div className="absolute right-0">
              {editField == "phone" ? (
                <div>
                  <button
                    type="submit"
                    onClick={save}
                    className={`text-white bg-green-500 whitespace-pre py-1 px-5  border-r-0 border-2 border-green-500 rounded-br-none rounded-tr-none rounded-full active:scale-[0.98] active:opacity-90 transition-all  ${
                      isLoading && !showSide ? "opacity-75 cursor-wait" : ""
                    }`}
                  >
                    {isLoading && !showSide ? "Saving..." : "Save"}
                  </button>
                  <button
                    id="close"
                    type="reset"
                    onClick={closeSide}
                    className="whitespace-pre py-1 px-3  border-2 border-gray-300 rounded-bl-none rounded-tl-none rounded-full active:scale-[0.98] active:opacity-90 transition-all hover:border-gray-700 focus-visible:border-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditField("phone")}
                  className="whitespace-pre py-1 px-3  border-2 border-gray-300 rounded-full active:scale-[0.98] active:opacity-90 transition-all hover:border-gray-700 focus-visible:border-gray-700"
                >
                  Edit
                </button>
              )}
            </div>
          </form>

          <form onSubmit={save} className="flex justify-between mb-6 relative">
            <div className="w-3/4">
              <h2 className="py-1 text-xl">Name</h2>
              {editField == "name" ? (
                <input
                  onChange={manageForm}
                  defaultValue={data.me.name}
                  type="text"
                  maxLength={50}
                  placeholder="Your name"
                  dir="auto"
                  name="name"
                  className="py-1 border-b-2 border-gray-300 w-full focus:border-gray-500"
                  disabled={!(editField == "name")}
                />
              ) : (
                <span className="py-1 border-b-2 border-gray-300 w-full block">
                  {data.me.name}
                </span>
              )}
              <span
                className={`text-red-500 text-sm ${
                  messages.name ? "opacity-100" : "opacity-0"
                }`}
              >
                {messages.name || "Invalid nadata.me."}
              </span>

              <p className=" text-gray-700">
                Your name appeare on your Profile page, as your byline, and in
                your responses.
              </p>
            </div>
            <div className="absolute right-0">
              {editField == "name" ? (
                <div>
                  <button
                    onClick={save}
                    className={`text-white bg-green-500 whitespace-pre py-1 px-5  border-r-0 border-2 border-green-500 rounded-br-none rounded-tr-none rounded-full active:scale-[0.98] active:opacity-90 transition-all ${
                      isLoading && !showSide ? "opacity-75 cursor-wait" : ""
                    }`}
                  >
                    {isLoading && !showSide ? "Saving..." : "Save"}
                  </button>
                  <button
                    id="close"
                    onClick={closeSide}
                    className="whitespace-pre py-1 px-3  border-2 border-gray-300 rounded-bl-none rounded-tl-none rounded-full active:scale-[0.98] active:opacity-90 transition-all hover:border-gray-700 focus-visible:border-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditField("name")}
                  className="whitespace-pre py-1 px-3  border-2 border-gray-300 rounded-full active:scale-[0.98] active:opacity-90 transition-all hover:border-gray-700 focus-visible:border-gray-700"
                >
                  Edit
                </button>
              )}
            </div>
          </form>

          <form onSubmit={save} className="flex justify-between mb-6 relative">
            <div className="w-3/4">
              <h2 className="py-1 text-xl">Address</h2>
              {editField == "address" ? (
                <input
                  onChange={manageForm}
                  dir="auto"
                  defaultValue={data.me.address}
                  type="text"
                  name="address"
                  maxLength={150}
                  placeholder="Add your address"
                  className="py-1 border-b-2 border-gray-300 w-full focus:border-gray-500"
                  disabled={!(editField == "address")}
                />
              ) : (
                <span className="py-1 border-b-2 border-gray-300 w-full block">
                  {data.me.address}
                </span>
              )}
              <span
                className={`text-red-500 text-sm ${
                  messages.address ? "opacity-100" : "opacity-0"
                }`}
              >
                {messages.address}
              </span>

              <p className="text-gray-700">Your home address for fast send.</p>
            </div>
            <div className="absolute right-0">
              {editField == "address" ? (
                <div>
                  <button
                    onClick={save}
                    className={`text-white bg-green-500 whitespace-pre py-1 px-5  border-r-0 border-2 border-green-500 rounded-br-none rounded-tr-none rounded-full active:scale-[0.98] active:opacity-90 transition-all ${
                      isLoading && !showSide ? "opacity-75 cursor-wait" : ""
                    }`}
                  >
                    {isLoading && !showSide ? "Saving..." : "Save"}
                  </button>
                  <button
                    id="close"
                    onClick={closeSide}
                    className="whitespace-pre py-1 px-3  border-2 border-gray-300 rounded-bl-none rounded-tl-none rounded-full active:scale-[0.98] active:opacity-90 transition-all hover:border-gray-700 focus-visible:border-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditField("address")}
                  className="whitespace-pre py-1 px-3  border-2 border-gray-300 rounded-full active:scale-[0.98] active:opacity-90 transition-all hover:border-gray-700 focus-visible:border-gray-700"
                >
                  Edit
                </button>
              )}
            </div>
          </form>

          <h1 className="text-3xl border-b-2 border-gray-300 mb-4 mt-6 py-2">
            Account
          </h1>

          <div className="flex justify-between mb-4">
            <div>
              <h2 className="py-1 text-xl">Change password</h2>
              <p className="py-1 text-gray-700">
                change your accounts password with given the old password
              </p>
            </div>
            <div>
              <button
                onClick={() => {
                  setShowSide("changePassword");
                  setIsLoading(false);
                }}
                className="whitespace-pre py-1 px-3  border-2 border-gray-300 rounded-full active:scale-[0.98] active:opacity-90 transition-all hover:border-gray-700 focus-visible:border-gray-700"
              >
                Change
              </button>
            </div>
            {showSide == "changePassword" ? (
              <div
                id="close"
                onClick={closeSide}
                className={`bg-[#00000078] backdrop-blur-sm fixed w-screen h-screen right-0 top-0 flex flex-col-reverse sm:flex-row-reverse z-20 ${
                  showSide == "changePassword"
                    ? ""
                    : "opacity-0 pointer-events-none"
                }`}
              >
                <div
                  className={`${
                    showSide == "changePassword"
                      ? "translate-0"
                      : "translate-y-[100%] sm:translate-x-[100%] sm:translate-y-0"
                  } overflow-auto transition-all border-2 border-gray-100 flex flex-col bg-white absolute rounded-tr-3xl rounded-tl-3xl w-full h-4/5 sm:rounded-tr-none sm:rounded-bl-3xl sm:h-full sm:w-[28rem]`}
                >
                  <button
                    id="close"
                    className="p-2 w-full flex items-center justify-center sm:w-auto sm:h-full sm:left-0 sm:absolute"
                  >
                    <div className="rounded-full bg-gray-200 w-20 h-1 sm:h-20 sm:w-1"></div>
                  </button>
                  <form
                    onSubmit={changePassword}
                    method="POST"
                    className="flex flex-col items-center justify-center p-8"
                  >
                    <h1 className="text-2xl w-full mb-2">
                      Change Your Password
                    </h1>
                    <div className="w-full my-1 text-lg flex flex-col">
                      <input
                        className="border-gray-300 border-b-2 py-1 placeholder:text-gray-600 w-full focus:border-gray-500 focus:placeholder:text-gray-700"
                        type="password"
                        name="old_password"
                        placeholder="Current password"
                        autocomplete="current-password"
                        onChange={manageForm}
                        required={true}
                      />
                      <span
                        className={`text-sm text-red-500 pt-1 ${
                          messages.old_password ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {messages.old_password || "."}
                      </span>
                    </div>
                    <div className="w-full my-1 text-lg flex flex-col">
                      <input
                        className="border-gray-300 border-b-2 py-1 placeholder:text-gray-600 w-full focus:border-gray-500 focus:placeholder:text-gray-700"
                        type="password"
                        name="new_password1"
                        placeholder="New password"
                        autocomplete="new-password"
                        onChange={manageForm}
                        pattern=".{8,}"
                        required={true}
                      />
                      <span
                        className={`text-sm text-red-500 pt-1 ${
                          messages.new_password1 ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {messages.new_password1 || "Password is too short."}
                      </span>
                    </div>
                    <div className="w-full my-1 text-lg flex flex-col">
                      <input
                        className="border-gray-300 border-b-2 py-1 placeholder:text-gray-600 w-full focus:border-gray-500 focus:placeholder:text-gray-700"
                        type="password"
                        name="new_password2"
                        placeholder="Retype new password"
                        autocomplete="new-password"
                        onChange={manageForm}
                        required={true}
                      />
                      <span
                        className={`text-sm text-red-500 pt-1 ${
                          messages.new_password2 ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {messages.new_password2 || "."}
                      </span>
                    </div>
                    <button
                      type="submit"
                      disabled={
                        !(
                          formData.old_password &&
                          formData.new_password1 == formData.new_password2
                        )
                      }
                      className={`px-4 py-3 w-full mt-1 rounded-full active:scale-[0.98] transition-all flex items-center justify-center bg-gray-900 text-white font-semibold text-lg disabled:opacity-50 disabled:pointer-events-none ${
                        isLoading ? "opacity-50 cursor-wait" : ""
                      }`}
                    >
                      {isLoading ? "Changing..." : "Change"}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>

          <div className="flex justify-between mb-4">
            <div>
              <h2 className="py-1 text-xl">Sign out of all other sessions</h2>
              <p className="py-1 text-gray-700">
                This will sign you out of sessions on other browsers or on other
                computers
              </p>
            </div>
            <div>
              <button
                onClick={() => setShowSide("killother")}
                className="whitespace-pre py-1 px-3  border-2 border-gray-300 rounded-full active:scale-[0.98] active:opacity-90 transition-all hover:border-gray-700 focus-visible:border-gray-700"
              >
                Kill other
              </button>
            </div>
            {showSide == "killother" ? (
              <Container
                sideName="killother"
                title="Kill all another sessions?"
                about="if you press kill, all another sessions in another computers and browsers will be sign out."
                btn="Kill"
                func={killAll}
              />
            ) : (
              ""
            )}
          </div>

          <div className="flex justify-between mb-4">
            <div>
              <h2 className="py-1 text-xl">Sign out </h2>
              <p className="py-1 text-gray-700">
                This will sign you out of session on this browser.
              </p>
            </div>
            <div>
              <button
                onClick={() => setShowSide("signout")}
                className="whitespace-pre py-1 px-3  border-2 border-gray-300 rounded-full active:scale-[0.98] active:opacity-90 transition-all hover:border-gray-700 focus-visible:border-gray-700"
              >
                Sign out
              </button>
            </div>
            {showSide == "signout" ? (
              <Container
                sideName="signout"
                title="Sing out from this account?"
                about="This will sign you out of session on this browser."
                btn="Sign out"
                func={signOut}
              />
            ) : (
              ""
            )}
          </div>

          <div className="flex justify-between mb-4">
            <div>
              <h2 className="py-1 text-xl">Delete account</h2>
              <p className="py-1 text-gray-700">
                Permanently delete your account and all of your content
              </p>
            </div>
            <div>
              <button
                onClick={() => setShowSide("delete")}
                className="whitespace-pre py-1 px-3  border-2 border-gray-300 rounded-full active:scale-[0.98] active:opacity-90 transition-all hover:border-gray-700 focus-visible:border-gray-700"
              >
                Delete
              </button>
            </div>
            {showSide == "delete" ? (
              <Container
                sideName="delete"
                title="Delete your account?"
                about="Permanently delete your account and all of your contents"
                btn="Delete"
                func={null}
              />
            ) : (
              ""
            )}
          </div>
        </section>
      ) : (
        <section className="p-6 max-w-6xl w-full">
          <div className="border-b-2 border-gray-300 mb-4 py-2">
            <div className="h-6 w-1/2 bg-gray-200 overflow-hidden relative fadeInLoad rounded-full" />
          </div>
          <div className="flex justify-between mb-6">
            <div className="w-3/4 fadeInLoad overflow-hidden relative">
              <div className="h-5 my-1 w-1/4 bg-gray-200 rounded-full" />
              <div className="h-3 mt-2 my-1 w-full bg-gray-200 rounded-full " />
              <div className="h-3 my-1 w-3/4 bg-gray-200 rounded-full " />
              <div className="h-3 mt-3 my-1 w-full bg-gray-200 rounded-full " />
              <div className="h-3 my-1 w-3/4 bg-gray-200 rounded-full " />
            </div>
            <div className="  flex items-center justify-center">
              <div className="w-[6rem] sm:w-[7rem] aspect-square rounded-full relative fadeInLoad overflow-hidden bg-gray-200" />
            </div>
          </div>

          <div className="flex justify-between mb-4 overflow-hidden relative fadeInLoad">
            <div className="w-full">
              <div className="h-5 my-1 w-1/4 bg-gray-200 rounded-full" />
              <div className="h-3 mt-3 w-1/2 bg-gray-200 rounded-full " />
              <div className="h-3 mt-2 w-3/4 bg-gray-200 rounded-full " />
            </div>
            <div>
              <div className="py-1 px-3 rounded-full bg-gray-200 relative fadeInLoad overflow-hidden  w-12 h-8" />
            </div>
          </div>
          <div className="flex justify-between mb-4 overflow-hidden relative fadeInLoad">
            <div className="w-full">
              <div className="h-5 my-1 w-1/4 bg-gray-200 rounded-full" />
              <div className="h-3 mt-3 w-1/2 bg-gray-200 rounded-full " />
              <div className="h-3 mt-2 w-3/4 bg-gray-200 rounded-full " />
            </div>
            <div>
              <div className="py-1 px-3 rounded-full bg-gray-200 relative fadeInLoad overflow-hidden  w-12 h-8" />
            </div>
          </div>
          <div className="flex justify-between mb-4 overflow-hidden relative fadeInLoad">
            <div className="w-full">
              <div className="h-5 my-1 w-1/4 bg-gray-200 rounded-full" />
              <div className="h-3 mt-3 w-1/2 bg-gray-200 rounded-full " />
              <div className="h-3 mt-2 w-3/4 bg-gray-200 rounded-full " />
            </div>
            <div>
              <div className="py-1 px-3 rounded-full bg-gray-200 relative fadeInLoad overflow-hidden  w-12 h-8" />
            </div>
          </div>
          <div className="flex justify-between mb-4 overflow-hidden relative fadeInLoad">
            <div className="w-full">
              <div className="h-5 my-1 w-1/4 bg-gray-200 rounded-full" />
              <div className="h-3 mt-3 w-1/2 bg-gray-200 rounded-full" />
              <div className="h-3 mt-2 w-3/4 bg-gray-200 rounded-full" />
            </div>
            <div>
              <div className="py-1 px-3 rounded-full bg-gray-200 relative fadeInLoad overflow-hidden  w-12 h-8" />
            </div>
          </div>

          <div className="border-b-2 border-gray-300 mb-4 py-2">
            <div className="h-6 w-1/2 bg-gray-200 overflow-hidden relative fadeInLoad rounded-full" />
          </div>

          <div className="flex justify-between mb-4 overflow-hidden relative fadeInLoad">
            <div className="w-full">
              <div className="h-5 my-1 w-1/4 rounded-full bg-gray-200" />
              <div className="h-3 mt-2 w-3/4 bg-gray-200 rounded-full " />
            </div>
            <div>
              <div className="py-1 px-3 rounded-full bg-gray-200 relative fadeInLoad overflow-hidden  w-16 h-8" />
            </div>
          </div>
          <div className="flex justify-between mb-4 overflow-hidden relative fadeInLoad">
            <div className="w-full">
              <div className="h-5 my-1 w-1/4 rounded-full bg-gray-200" />
              <div className="h-3 mt-2 w-3/4 bg-gray-200 rounded-full " />
            </div>
            <div>
              <div className="py-1 px-3 rounded-full bg-gray-200 relative fadeInLoad overflow-hidden  w-16 h-8" />
            </div>
          </div>
          <div className="flex justify-between mb-4 overflow-hidden relative fadeInLoad">
            <div className="w-full">
              <div className="h-5 my-1 w-1/4 rounded-full bg-gray-200" />
              <div className="h-3 mt-2 w-3/4 bg-gray-200 rounded-full " />
            </div>
            <div>
              <div className="py-1 px-3 rounded-full bg-gray-200 relative fadeInLoad overflow-hidden  w-16 h-8" />
            </div>
          </div>
          <div className="flex justify-between mb-4 overflow-hidden relative fadeInLoad">
            <div className="w-full">
              <div className="h-5 my-1 w-1/4 rounded-full bg-gray-200" />
              <div className="h-3 mt-2 w-3/4 bg-gray-200 rounded-full " />
            </div>
            <div>
              <div className="py-1 px-3 rounded-full bg-gray-200 relative fadeInLoad overflow-hidden  w-16 h-8" />
            </div>
          </div>
        </section>
      )}

    </main>
  );
};

const Page404 = () =>{
  return (    
  <main className="flex flex-col items-center justify-center w-full h-[100vh]">
  <h1 className="text-[140px] sm:text-[240px] font-bold">404</h1>
    <p>Sorry, this page not found :(</p>
    <Link to="/" className="m-4 block px-8 py-4 text-white bg-gray-900 rounded-full font-bold"> Home page </Link>
  </main>
)
}