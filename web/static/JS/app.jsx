const Link = ReactRouterDOM.Link;
const Route = ReactRouterDOM.Route;
const Router = ReactRouterDOM.BrowserRouter;
const Switch = ReactRouterDOM.Switch;
const useParams = ReactRouterDOM.useParams;
const useContext = React.useContext;
const useState = React.useState;
const useEffect = React.useEffect;
const createContext = React.createContext;


const Loading = ({ classNamees }) => {
  return <div className={"loader " + classNamees}></div>;
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
          className="p-4 w-full m-0 rounded-xl bg-indigo-700 text-white active:scale-95 transition-all flex items-center justify-center"
        >
          {isLoading ? (
            <Loading classNamees={"text-[3px]"} />
          ) : status == "Get-Token" ? (
            "Send"
          ) : (
            status.replace(/\W+/g, "")
          )}
        </button>
        <Link
          onClick={hanldeClickHelpBtn}
          to={about[status]["helpurl"]}
          className={`w-full text-center pt-4 text-indigo-600 hover:text-indigo-500 ${
            codeTimeOut > 0 && status == "Get-Token"
              ? "opacity-75 cursor-default"
              : " cursor-pointer"
          }`}
        >
          {about[status]["help"]}
          {codeTimeOut > 0 && status == "Get-Token" && ` (${codeTimeOut})`}
        </Link>
      </form>

      <span className="text-slate-600 my-2 absolute bottom-0 text-sm">
        {`© ${data.sitename} ${year}. All right reserved.`}
      </span>
    </main>
  );
};

const EditProfile = () => {
  const [data, setData] = useContext(Context).data;
  const [formData, setFormData] = useState(data.user);
  const [user, setUser] = useState(data.user);
  const [messages, setMessages] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [oked, setOked] = useState(false);
  const manageData = (e) => {
    setMessages({});
    if (e.target.name == "profile") {
      const [file] = e.target.files;
      e.target.nextElementSibling.setAttribute(
        "src",
        URL.createObjectURL(file)
      );
      setFormData({ ...formData, [e.target.name]: file });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const hanldeSubmit = (e) => {
    e.preventDefault();
    setMessages({});
    setIsLoading(true);
    const thisForm = new FormData();
    thisForm.append("name", formData.name);
    thisForm.append("phone", formData.phone);
    thisForm.append("email", formData.email);
    thisForm.append("profile", formData.profile || "");
    thisForm.append("lat", formData.lat);
    thisForm.append("lng", formData.lng);
    thisForm.append("address", formData.address);
    thisForm.append("csrfmiddlewaretoken", data.csrfmiddlewaretoken);

    $.ajax({
      method: "POST",
      url: "/api/accounts/edit",
      data: thisForm,
      contentType: false,
      processData: false,
      success: (r) => {
        setIsLoading(false);
        if (r.result === "ok") {
          console.log(r.user);
          setData({ ...data, ["user"]: r.user });
          setOked(true);
        }
        setMessages(r);
      },
    });
  };
  return (
    <main className="flex w-full flex-col items-center mt-20">
      <HeaderSection />
      <form
        className="container p-10 flex items-center max-w-[50rem] flex-col justify-center relative"
        onSubmit={hanldeSubmit}
      >
        <div className="flex justify-center items-center relative group">
          <input
            name="profile"
            onChange={manageData}
            type="file"
            className="w-full h-full  z-[1] absolute cursor-pointer opacity-0"
            title="Click to change profile image"
          />
          <img
            src={user.profile}
            alt={`${user.name}'s profile image`}
            className="w-[6rem] sm:w-[7rem] aspect-square rounded-[33%] group-hover:brightness-75"
          />
          <div className="absolute w-5 h-5 rounded-full flex items-center justify-center bg-[#0000001a] opacity-75 group-hover:opacity-100 group-hover:scale-105">
            <i className="bi bi-pencil absolute text-white"></i>
          </div>
        </div>

        <span
          className={`ml-2 text-sm text-red-500 pb-3 pt-1 ${
            messages.profile ? "opacity-100" : ""
          }`}
        >
          {messages.profile || ""}
        </span>

        <div className="flex flex-col items-start w-full my-2">
          <div className="w-full my-1 text-lg flex flex-col">
            <input
              className="w-full bg-gray-100 p-3 rounded-lg placeholder:text-gray-600"
              type="text"
              maxLength="50"
              name="name"
              placeholder="name"
              onChange={manageData}
              defaultValue={user.name}
            />
            <span
              className={`ml-2 text-sm text-red-500 pt-1 ${
                messages.name ? "opacity-100" : ""
              }`}
            >
              {messages.name || ""}
            </span>
          </div>

          <div className="w-full my-1 text-lg flex flex-col">
            <input
              className="w-full bg-gray-100 p-3 rounded-lg placeholder:text-gray-600"
              type="tel"
              name="phone"
              placeholder="Phone"
              onChange={manageData}
              defaultValue={user.phone}
            />
            <span
              className={`ml-2 text-sm text-red-500 pt-1 ${
                messages.phone ? "opacity-100" : ""
              }`}
            >
              {messages.phone || ""}
            </span>
          </div>

          <div className="w-full my-1 text-lg flex flex-col">
            <input
              className="w-full bg-gray-100 p-3 rounded-lg placeholder:text-gray-600 "
              type="email"
              name="email"
              placeholder="Email"
              onChange={manageData}
              defaultValue={user.email}
            />
            <span
              className={`ml-2 text-sm text-red-500 pt-1 ${
                messages.email ? "opacity-100" : ""
              }`}
            >
              {messages.email || ""}
            </span>
          </div>

          <div className="w-full my-1 text-lg flex flex-col">
            <input
              className="w-full bg-gray-100 p-3 rounded-lg placeholder:text-gray-600 "
              type="text"
              name="address"
              placeholder="Address"
              onChange={manageData}
              defaultValue={user.address}
            />
            <span
              className={`ml-2 text-sm text-red-500 pt-1 ${
                messages.address ? "opacity-100" : ""
              }`}
            >
              {messages.address || ""}
            </span>
          </div>
        </div>
        <button
          type="submit"
          className={`w-full mt-20 rounded-xl text-white active:scale-95 transition-all flex items-center justify-center ${
            oked ? "bg-gray-900" : "bg-indigo-700"
          }`}
        >
          {isLoading ? (
            <Loading classNamees={"text-[3px] m-3"} />
          ) : oked ? (
            <Link to="/profile" className="py-4 px-8 block">
              Back to profile
            </Link>
          ) : (
            <span className="py-4 px-8 block">Submit Chages</span>
          )}
        </button>
      </form>
      <FooterSection />
    </main>
  );
};

const FooterSection = () => {
  const validUrl = ["instagram", "twitter", "github", "facebook", "linkedin"];
  const year = new Date().getFullYear();
  const [data, setData] = useContext(Context).data;

  return (
    <footer className="w-full text-sm flex items-center justify-around py-10 flex-col-reverse md:flex-row">
      <span className="font-normal text-slate-600 my-2">
        {`© ${data.sitename} ${year}. All right reserved.`}
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
              href={link.slug}
              className="p-1"
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
  );
};

const HeaderSection = () => {
  const [isShow, setIsShow] = useState(false);
  const [data, setData] = useContext(Context).data;

  return (
    <header
      className={`z-10 flex justify-between items-center flex-col fixed sm:flex-row top-0 w-full bg-[#ffffffbf] backdrop-blur-md sm:h-16 overflow-hidden ${
        isShow ? "h-auto" : "h-16"
      }`}
    >
      <h1 className="text-xl p-4 font-medium">
        <Link to="/">{data.sitename}</Link>
      </h1>
      <ul className="items-center w-full h-auto flex-col flex sm:flex-row sm:bg-transparent sm:w-auto">
        <li className="w-full whitespace-nowrap hover:text-slate-700 cursor-pointer transition-all text-center">
          <Link to="/" className="p-4 block">
            Home
          </Link>
        </li>

        {data.about ? (
          <li className="w-full whitespace-nowrap hover:text-slate-700 cursor-pointer transition-all text-center">
            <Link to="/about" className="p-4 block">
              About
            </Link>
          </li>
        ) : (
          ""
        )}

        {data.user.id ? (
          <li className="w-full whitespace-nowrap hover:text-slate-700 cursor-pointer transition-all text-center">
            <Link to="/cart" className="p-4 block">
              Cart
            </Link>
          </li>
        ) : (
          ""
        )}

        {data.user.isSuperUser ? (
          <li className="w-full whitespace-nowrap hover:text-slate-700 cursor-pointer transition-all text-center">
            <Link to="/admin-panel" className="p-4 block">
              Admin panel
            </Link>
          </li>
        ) : (
          ""
        )}

        {data.user.id ? (
          <li className="w-full">
            <Link to="/profile" className="w-full flex items-center">
              <img
                src={data.user.profile}
                alt="Your profile image"
                className="overflow-hidden rounded-[33%] min-w-[3rem] w-[15%] m-2 aspect-square sm:w-[2.5rem] sm:min-w-[2.5rem] sm:h-[2.5rem]"
              />
              <div className="m-1 w-full overflow-hidden sm:w-0 sm:m-0 truncate">
                <span className="font-medium text-base">{data.user.name}</span>
                <br />
                <span className="font-light text-sm text-slate-600">
                  {data.user.email || data.user.phone}
                </span>
              </div>
            </Link>
          </li>
        ) : (
          <li className="w-[90%] border-2 border-gray-700  m-2  cursor-pointer text-center rounded-full bg-gray-900 text-white">
            <Link to="/accounts/sign-in" className="py-2 px-6 block">
              Signin
            </Link>
          </li>
        )}
      </ul>

      <div
        onClick={() => setIsShow(!isShow)}
        id="more"
        className={`cursor-pointer absolute right-0 top-0 m-2 p-2 h-10 w-12 sm:w-0 sm:h-0 flex flex-col items-center justify-between text-slate-900 ${
          isShow ? "active" : ""
        }`}
      >
        <span className="w-full rounded-full h-[2px] bg-slate-900"></span>
        <span className="w-full rounded-full h-[2px] bg-slate-900"></span>
        <span className="w-full rounded-full h-[2px] bg-slate-900"></span>
      </div>
    </header>
  );
};

const MyCart = () => {
  const [data, setData] = useContext(Context).data;
  const [totalPrice, setTotalPrice] = useState(0);
  const [messages, setMessages] = useState({});
  const [paid, setPaid] = useState(data.cartPaid);

  const [formData, setFormData] = useState({
    csrfmiddlewaretoken: data.csrfmiddlewaretoken,
    address: data.user.address,
    lat: data.user.lat,
    lng: data.user.lng,
  });

  const MiniFoodInCart = ({ food }) => {
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
          console.log(r);
          if (r.result == "ok") {
            setData({ ...data, ["cart"]: r.cart });
          }
        },
      });
    };

    const countManager = (e) => {
      if (!paid) {
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
        <div className="flex w-full aspect-video items-center justify-center rounded-xl overflow-hidden">
          <img
            src={food.image}
            alt={`${food.name}'s image`}
            className="h-full"
          />
        </div>
        <div className="flex flex-col h-full justify-between">
          <Link
            to={food.slug}
            className="my-1 font-medium underline truncate"
          >
            {food.name}
          </Link>

          <div className="flex justify-between items-center py-1">
            <span className="text-gray-800 mr-1 py-1">🔥 {food.cal}cal</span>

            <span className="font-meduim">${food.price}</span>
          </div>
          <div className="number flex justify-between items-center w-full my-2">
            <button
              name="-"
              onClick={countManager}
              className={
                "flex items-center justify-center rounded-lg w-12 h-12 text-2xl active:scale-95 transition-all " +
                (foodCount == 1
                  ? "bg-red-200 text-red-600 hover:bg-red-700 hover:text-white"
                  : "bg-indigo-200 text-indigo-600 hover:bg-indigo-700 hover:text-white")
              }
            >
              -
            </button>
            <span className="text-3xl text-center">{foodCount}</span>
            <button
              name="+"
              onClick={countManager}
              className="flex items-center justify-center bg-indigo-200 text-indigo-600 hover:bg-indigo-700 hover:text-white rounded-lg w-12 h-12 text-2xl active:scale-95 transition-all"
            >
              +
            </button>
          </div>
        </div>
      </div>
    );
  };

  const manageData = (e) => {
    setMessages({});
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const hanldeSubmit = (e) => {
    e.preventDefault();
    if (!paid) {
      $.ajax({
        method: "POST",
        url: "/api/cart/pay",
        data: formData,
        success: (r) => {
          if (r.result == "ok") {
            setPaid(true);
          }
        },
      });
    }
  };

  useEffect(() => {
    let total = 0;
    data.cart.map((item) => (total += item.quantity * item.price));
    setTotalPrice(total);
  }, [data.cart]);

  return (
    <main className="flex w-full flex-col items-center mt-20">
      <HeaderSection />

      {data.cart.length ? (
        <div className="container grid grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col m-4 lg:mr-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold">
                Order list
                <small className="text-slate-500 font-normal">
                  ({data.cart.length})
                </small>
              </h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-3 overflow-x-hidden overlfow-y-auto h-[75vh]">
              {data.cart.map((item) => (
                <MiniFoodInCart food={item} key={item.id} />
              ))}
            </div>
          </div>
          <form onSubmit={hanldeSubmit} className="flex flex-col m-4 lg:ml-4">
            <div
              id="map-default"
              className="map-canvas h-[300px] lg:h-full max-w-full"
              data-lat={data.user.lat}
              data-lng={data.user.lng}
            ></div>
            <div className="my-2 text-xl flex">
              <span className="text-semibold">Address: </span>
              <input
                type="text"
                className="text-slate-800 text-lg ml-2 w-full"
                defaultValue={data.user.address}
                name="address"
                onChange={manageData}
              />
            </div>
            <div className="flex justify-between items-start my-4 w-full text-xl">
              <span>Total Price:</span>
              <span className="text-gray-800">${totalPrice}</span>
            </div>
            <button
              className={`py-4 px-8 w-full m-0 rounded-x text-white transition-all rounded-2xl ${
                paid ? "bg-gray-900" : "bg-indigo-700 active:scale-95"
              }`}
            >
              {paid ? "Sending ..." : "Pay"}
            </button>
          </form>
        </div>
      ) : (
        <div className="w-full text-center h-[75vh] flex items-center justify-center flex-col">
          <span class="text-lg">Cart is empty :( </span>
        </div>
      )}

      <FooterSection />
    </main>
  );
};

const Card = ({ food, type = "mini" }) => {
  const [data, setData] = useContext(Context).data;

  const handleLike = (e) => {
    $.ajax({
      method: "POST",
      url: "/api/foods/like",
      data: { csrfmiddlewaretoken: data.csrfmiddlewaretoken, id: food.id },
      success: (r) => {
        if (r.result == "ok") {
          setData({ ...data, ["likedFoods"]: r.likedFoods });
        }
      },
    });
  };

  return (
    <Context.Provider value="">
      {type == "mini" ? (
        <div className="relative p-2 bg-white shadow-lg snap-start w-[30vw] min-w-[200px] max-w-[350px] flex-col overflow-hidden rounded-xl m-2 card flex h-full">
          <Link to={`/foods/${food.slug}`}>
            <div className="flex w-full aspect-video items-center justify-center rounded-xl overflow-hidden">
              <img
                src={food.image}
                alt={`${food.name}'s image`}
                className="h-full"
              />
            </div>
            <div className="flex flex-col h-full justify-between">
              <h1 className="py-1 font-medium text-lg truncate">
                {food.name}
              </h1>
              <span className="text-gray-800 py-1">🔥 {food.cal}cal</span>
              <span className="font-meduim  py-1">${food.price}</span>
            </div>
          </Link>
          <i
            className={`bi cursor-pointer absolute bottom-0 right-0 py-2 px-3 active:scale-75  ${
              data.likedFoods && data.likedFoods.includes(food.id)
                ? "bi-heart-fill text-red-600"
                : "bi-heart"
            }`}
            onClick={handleLike}
          ></i>
        </div>
      ) : (
        <Link
          to={`/foods/${food.slug}`}
          className="first:ml-[10%] last:mr-[10%] snap-center mx-2 sm:mx-4 bg-cover bg-center w-[80%] min-w-[80%] aspect-video sm:max-h-[24rem] lg:max-h-[26rem] sm:h-auto flex items-end max-w-[90rem] justify-center rounded-xl relative overflow-hidden after:absolute after:h-1/3 after:w-full after:bg-gradient-to-t after:from-[#000000be] "
          style={{ backgroundImage: `url(${food.image})` }}
        >
          <span className="text-black p-1 rounded-full bg-[#ffffffbf] text-sm absolute right-0 top-0 m-1">
            🔥 {food.cal}cal
          </span>
          <div className="w-full z-[1] m-2 sm:m-6 truncate">
            <h1 className="my-1 font-medium text-base sm:text-lg text-white">
              {food.name}
            </h1>
            <span className="text-slate-200 py-1 text-sm sm:text-base">
              {food.about}
            </span>
          </div>
        </Link>
      )}
    </Context.Provider>
  );
};

const Feedbacks = ({ feedbacks }) => {
  return (
    <div className="container flex-col flex items-center justify-center py-12 px-6">
      <h1 className="font-medium text-3xl">What our customers are saying</h1>
      <div className="py-4 flex items-center overflow-auto w-full">
        {feedbacks.map((feedback) => (
          <div className="relative p-2 bg-white shadow-lg  h-[200px] w-[300px] min-w-[250px] flex-col overflow-hidden rounded-xl m-4 flex ">
            <div className="flex flex-col h-full justify-between">
              <p className="text-gray-700 p-2 my-1 text-sm ">{feedback.text}</p>
              <div className="w-full flex items-center">
                <img
                  src={feedback.user__profile}
                  alt={`${feedback.user__name}'s profile`}
                  className="overflow-hidden rounded-[33%] min-w-[3rem] w-[15%] m-2 ml-0 aspect-square sm:w-[2.5rem] sm:min-w-[2.5rem] sm:h-[2.5rem]"
                />
                <span className="font-medium text-lg m-1 ">
                  {feedback.user__name}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// const MainFood = ({ food }) => {
//   return (
//     <Link
//       to={food.slug}
//       className="first:ml-[10%] last:mr-[10%] snap-center mx-2 sm:mx-4 bg-cover bg-center w-[80%] min-w-[80%] aspect-video sm:max-h-[24rem] lg:max-h-[26rem] sm:h-auto flex items-end max-w-[90rem] justify-center rounded-xl relative overflow-hidden after:absolute after:h-1/3 after:w-full after:bg-gradient-to-t after:from-[#000000be] "
//       style={{ backgroundImage: `url(${food.image})` }}
//     >
//       <span className="text-black p-1 rounded-full bg-[#ffffffbf] text-sm absolute right-0 top-0 m-1">
//         🔥 {food.cal}cal
//       </span>
//       <div className="w-full z-[1] m-2 sm:m-6 truncate">
//         <h1 className="my-1 font-medium text-base sm:text-lg text-white">
//           {food.name}
//         </h1>
//         <span className="text-slate-200 py-1 text-sm sm:text-base">
//           {food.about}
//         </span>
//       </div>
//     </Link>
//   );
// };

const Reccomendeds = () => {
  const [data, setData] = useContext(Context).data;

  return (
    <div className="container overflow-x-auto relative after:h-full after:w-[10%] after:absolute after:left-0 after:top-0 after:bg-gradient-to-r after:from-white before:h-full before:w-[10%] before:absolute before:right-0 before:top-0 before:bg-gradient-to-l before:from-white before:z-[2]">
      <div
        className="no-scrollbar flex overflow-x-auto"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {data.reccomendeds.map((p) => (
          <Card food={p} key={p.id} type="main" />
        ))}
      </div>
    </div>
  );
};

const Category = ({ title, foods }) => {
  return (
    <div className="container p-4 flex-col flex items-start max-w-[90rem]">
      <h1 className="text-xl m-2">{title}</h1>
      <div
        className="pb-4 flex items-center overflow-auto w-full"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {foods.map((food) => (
          <Card food={food} key={food.id} />
        ))}
      </div>
    </div>
  );
};

const BuySection = () => {
  const [foodCount, setFoodCount] = useState(1);
  const [food, setFood] = useState({});
  const [data, setData] = useContext(Context).data;
  const [paid, setPaid] = useState(false);
  const url = useParams();

  const manageBuyBtn = () => {
    if (paid == false) {
      $.ajax({
        method: "POST",
        url: "/api/buy",
        data: {
          csrfmiddlewaretoken: data.csrfmiddlewaretoken,
          id: food.id,
          quantity: foodCount,
        },
        success: (r) => {
          if (r.result == "ok") {
            setData({ ...data, ["cart"]: r.cart });
            setPaid(true);
          }
        },
      });
    }
  };

  useEffect(() => {
    console.log("data is:", data.foods)
    const food = data.foods.map((g) => g.foods.filter((f) => f.url == `/foods/${url.slug}`)).filter((arr) => arr.length)[0][0];
    setFood(food);
    data.cart.map((item) => {
      if (item.id == food.id) {
        setFoodCount(item.quantity);
        setPaid(true);
      }
    });
  }, [data.foods,data.cart]);

  const countManager = (e) => {
    setPaid(false);
    if (e.target.name == "+" && foodCount < 100) {
      setFoodCount(foodCount + 1);
    }
    if (e.target.name == "-" && 1 < foodCount) {
      setFoodCount(foodCount - 1);
    }
  };

  return (
    <main className="flex w-full flex-col items-center mt-20">
      <HeaderSection />

      <div className="container p-10 flex items-center max-w-[50rem] flex-col justify-center relative">
        <div className="rounded-xl w-full aspect-video sm:min-w-fit sm:max-w-fit flex items-center justify-center overflow-hidden">
          <img
            src={food.image}
            alt={`${food.name}'s image`}
            className="h-full"
          />
        </div>
        <div className="flex justify-between flex-col w-full">
          <h1 className="my-4 font-medium text-lg">{food.name}</h1>
          <p className="my-1 whitespace-normal font-light truncate overflow-hidden">
            {food.about}
          </p>
          <div className="flex justify-between items-center my-4 w-full text-lg">
            <span className="text-gray-800 mr-1 py-1">🔥 {food.cal}cal</span>
            <span className="text-gray-800">${food.price}</span>
          </div>

          <div className="number flex justify-between items-center w-full my-4">
            <button
              name="-"
              onClick={countManager}
              className="flex items-center justify-center bg-indigo-200 text-indigo-600 hover:bg-indigo-700 hover:text-white rounded-lg w-12 h-12 text-2xl active:scale-95 transition-all"
            >
              -
            </button>
            <span className="text-3xl text-center">{foodCount}</span>
            <button
              name="+"
              onClick={countManager}
              className="flex items-center justify-center bg-indigo-200 text-indigo-600 hover:bg-indigo-700 hover:text-white rounded-lg w-12 h-12 text-2xl active:scale-95 transition-all"
            >
              +
            </button>
          </div>
          <button
            className={`w-full m-0 rounded-xl text-white active:scale-95 transition-all ${
              paid ? "bg-gray-900" : "bg-indigo-700"
            }`}
          >
            {paid ? (
              <Link to="/cart" className="py-4 px-8 block">
                Show Cart
              </Link>
            ) : (
              <span className="py-4 px-8 block" onClick={manageBuyBtn}>
                Add to cart
              </span>
            )}
          </button>
        </div>
      </div>
      <FooterSection />
    </main>
  );
};

const Profile = ({ isForAdmin = false }) => {
  const phone = useParams().phone;
  const [user, setUser] = useState({});
  const [data, setData] = useContext(Context).data;

  useEffect(() => {
    if (!user.id) {
      if (isForAdmin) {
        $.ajax({
          method: "POST",
          url: `/api/profile/${phone}`,
          data: {
            csrfmiddlewaretoken: data.csrfmiddlewaretoken,
          },
          success: (r) => {
            if (r.result == "ok") {
              setUser(r);
              console.log(r);
            }
          },
        });
      } else {
        setUser(data.user);
      }
    }
  });

  return (
    <main className="flex w-full flex-col items-center mt-20">
      <HeaderSection />
      <div className="container p-10 flex items-center max-w-[50rem] flex-col justify-center relative">
        <Link
          to={isForAdmin ? "/" : "/profile/edit"}
          className="flex justify-satrt items-center w-full flex-col h-[65vh] cursor-context-menu"
          title="Click to edit your profile"
        >
          <img
            src={user.profile}
            alt="Your profile image"
            className="w-[7rem] sm:w-[8rem] aspect-square rounded-[33%]"
          />

          <div className="flex flex-col m-4 text-center">
            <h1 className="text-semibold text-2xl my-2">{user.name}</h1>
            <span className="text-slate-500 text-sm sm:text-lg">
              {`${user.phone}${" | " + user.email || ""}`}
            </span>
            <span className="text-slate-700 text-md sm:text-lg">
              {user.address}
            </span>
          </div>
        </Link>
      </div>
      <FooterSection />
    </main>
  );
};

const Home = ({}) => {
  const [data, setData] = useContext(Context).data;
  const [sendFeedback, setSendFeedback] = useState(false);
  const [messages, setMessages] = useState({});
  const [formData, setFormData] = useState({});

  const hanldeSendFeedback = (e) => {
    console.log(e);
    e.preventDefault();
    $.ajax({
      method: "POST",
      url: "/api/feedbacks/send",
      data: {
        csrfmiddlewaretoken: data.csrfmiddlewaretoken,
        text: formData.text,
      },
      success: (r) => {
        if (r.result == "ok") {
          setSendFeedback(false);
        }
      },
    });
  };
  const manageData = (e) => {
    setMessages({});
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  return (
    <main className="flex w-full flex-col items-center mt-20">
      <HeaderSection />

      <Reccomendeds />

      {data.foods
        .slice(0, 4)
        .map((group) =>
          group.foods.length ? (
            <Category
              title={group.title}
              foods={group.foods}
              key={group.id}
            />
          ) : (
            ""
          )
        )}

      {data.feedbacks.length ? (
        <Feedbacks feedbacks={data.feedbacks} />
      ) : (
        ""
      )}

      {data.foods
        .slice(4)
        .map((group) =>
          group.foods.length ? (
            <Category
              title={group.title}
              foods={group.foods}
              key={group.id}
            />
          ) : (
            ""
          )
        )}
      {data.user.id ? (
        <div className="py-4 px-8 border-[1px] sm:border-2 border-slate-200 bg-indigo-200 text-indigo-700 rounded-3xl ">
          <button onClick={() => setSendFeedback(true)} className="">
            Send Feedback
          </button>
        </div>
      ) : (
        ""
      )}
      <div
        className={`${
          !sendFeedback ? "pointer-events-none opacity-0" : ""
        } bg-[#00000080] flex items-center justify-center w-full h-full z-[1000] fixed top-0 left-0`}
      >
        <form
          onSubmit={hanldeSendFeedback}
          className={`min-w-[250px] mx-4 flex flex-col bg-[#ffffffbf] backdrop-blur-md rounded-xl max-w-[40rem]  shadow-xl ${
            !sendFeedback ? "opacity-0 scale-95" : ""
          }`}
        >
          <input
            placeholder="Text..."
            maxLength="200"
            onChange={manageData}
            name="text"
            className="overflow-hidden m-4 focus:border-0 focus:outline-0 min-w-[250px]  bg-transparent"
          />
          <span
            className={`ml-2 text-sm text-red-500 pb-3 pt-1 ${
              messages.text ? "opacity-100" : ""
            }`}
          >
            {messages.text || ""}
          </span>
          <div className="flex">
            <button
              type="submit"
              className="p-3 w-full border-t-[1px] border-gray-300"
            >
              Send
            </button>
          </div>
        </form>
      </div>
      <FooterSection />
    </main>
  );
};

const About = ({}) => {
  const [data, setData] = useContext(Context).data;

  return (
    <main className="flex w-full flex-col items-center mt-20">
      <HeaderSection />
      <div className="container p-10 flex items-center max-w-[60rem] flex-col justify-center">
        <div className="rounded-xl w-full aspect-video  flex items-center justify-center overflow-hidden">
          <img
            src={data.about.image}
            alt={`${data.about.title}'s image`}
            className="h-full"
          />
        </div>
        <div className="flex justify-between flex-col h-full w-full">
          <h1 className="my-4 font-semibold text-lg">{data.about.title}</h1>
          <ReactMarkdown
            source={data.about.text}
            className="my-1  whitespace-normal"
          />
          <div
            id="map-default"
            className="map-canvas h-[300px] max-w-full"
            data-lat={data.about.lat}
            data-lng={data.about.lng}
          ></div>
        </div>
      </div>
      <FooterSection />
    </main>
  );
};
