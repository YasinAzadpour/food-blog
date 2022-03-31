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
  const [data, setData] = useContext(dataContext).data;

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
                messages.phone  ? "opacity-100" : ""
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
          ) : (
            status == "Get-Token"
            ?"Send"
            :status.replace(/\W+/g, "")
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
