const AdminPage = () => {
  const [mainChart, setMainChart] = useState(null);
  const [avFeedback, setAvFeedback] = useState({});
  const [adminData, setAdminData] = useContext(Context).adminData;
  const [data, setData] = useContext(Context).data;

  const updateChart = (newData) => {
    mainChart.config.data.datasets[0].data = newData.data;
    mainChart.config.data.labels = newData.labels;
    mainChart.update();
  };
  const markFeedbackAsRead = () => {
    $.ajax({
      method: "POST",
      url: "/api/feedbacks/mark-as-read",
      data: {
        csrfmiddlewaretoken: data.csrfmiddlewaretoken,
        id: avFeedback.id,
      },
      success: (r) => {
        if (r.result == "ok") {
          setAdminData({ ...adminData, ["feedbacks"]: r.feedbacks });
          setAvFeedback({});
        }
      },
    });
  };

  useEffect(() => {
    manageChart();
  }, [1]);

  const handleDeleteUser = (e) => {
    if (confirm("Do you want to delete this user?")) {
      $.ajax({
        method: "POST",
        url: "/api/accounts/remove",
        data: {
          csrfmiddlewaretoken: data.csrfmiddlewaretoken,
          id: e.target.getAttribute("name"),
        },
        success: (r) => {
          if (r.result == "ok") {
            setAdminData({ ...adminData, [users]: r.allUsers });
          }
        },
      });
    }
  };

  const handleDeleteFood = (e) => {
    if (confirm("Do you want to delete this food?")) {
      $.ajax({
        method: "POST",
        url: "/api/foods/remove",
        data: {
          csrfmiddlewaretoken: data.csrfmiddlewaretoken,
          id: e.target.getAttribute("name"),
        },
        success: (r) => {
          if (r.result == "ok") {
            setAdminData({ ...adminData, [foods]: r.foods });
          }
        },
      });
    }
  };

  const User = ({ user }) => {
    return (
      <div className="w-full flex items-center scale-95  ">
        <img
          src={user.profile}
          alt={`${user.name}'s profile image`}
          className="overflow-hidden rounded-[33%] min-w-[3rem] w-[15%] m-2 aspect-square sm:w-[2.5rem] sm:min-w-[2.5rem] sm:h-[2.5rem]"
        />
        <Link
          to={`/profile/${user.phone}`}
          className="m-1 w-full overflow-hidden truncate"
        >
          <span className="text-base underline">{user.name}</span>
          <br />
          <span className="font-light text-sm text-slate-600">
            {user.phone}
          </span>
        </Link>
        <button className="rounded-xl bg-red-200 text-red-400 hover:bg-red-600 hover:text-white transition-all active:scale-95 flex">
          <i
            name={user.id}
            onClick={handleDeleteUser}
            className="py-2 px-3 sm:p-0  bi bi-trash-fill sm:before:flex flex sm:before:text-[0px]"
          ></i>
          <span
            name={user.id}
            onClick={handleDeleteUser}
            className="sm:py-2 sm:px-4  none sm:inline flex  text-[0px] sm:text-sm"
          >
            Delete
          </span>
        </button>
      </div>
    );
  };

  const Feedback = ({ feedback }) => {
    return (
      <div
        onClick={() => setAvFeedback(feedback)}
        className="cursor-pointer items-center py-3 px-1 hover:bg-slate-100 w-full grid scale-95  "
        style={{ gridTemplateColumns: "30% 70%" }}
      >
        <span className="text-base truncate">{feedback.user__name}</span>

        <span className="mx-2 font-light text-sm text-slate-600 truncate">
          {feedback.text}
        </span>
      </div>
    );
  };

  const Card = ({ food }) => {
    return (
      <div className="relative p-2 bg-white shadow-lg  flex-col overflow-hidden rounded-xl m-2 card flex   h-min">
        <div className="flex w-full aspect-video items-center justify-center rounded-xl overflow-hidden">
          <img
            src={food.image}
            alt={`${food.name}'s image`}
            className="h-full"
          />
        </div>
        <div className="flex flex-col h-full justify-between">
          <h1 className="my-1 font-medium underline truncate">
            <Link to={`/foods/${food.slug}`}>{food.name}</Link>
          </h1>

          <div className="flex justify-between items-center py-1">
            <span className="text-gray-800 mr-1 py-1">🔥 {food.cal}cal</span>
            <h1 className="font-meduim">${food.price}</h1>
          </div>
          <div className="flex justify-between items-center py-1">
            <button className="m-1 rounded-xl bg-red-200 text-red-400 hover:bg-red-600 hover:text-white transition-all active:scale-95">
              <i
                name={food.id}
                onClick={handleDeleteFood}
                className="bi bi-trash-fill px-4 py-2 flex"
              ></i>
            </button>

            <button className="mr-0 m-1 px-4 py-1 rounded-xl bg-indigo-200 text-indigo-600 hover:bg-indigo-700 hover:text-white transition-all active:scale-95">
              <Link to={`/foods/update/${food.id}`}>Update</Link>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const manageChart = () => {
    const ctx = document.getElementById("mainCanvas").getContext("2d");

    const myChart = new Chart(ctx, {
      type: "line",
      responsive: true,
      data: {
        labels: adminData.income.year.labels,
        datasets: [
          {
            label: ["Income"],
            fill: true,
            backgroundColor: "transparent",
            borderColor: "#5f4eff",
            borderWidth: 2,
            borderDash: [],
            borderDashOffset: 0.0,
            pointBackgroundColor: "#5f4eff",
            pointBorderColor: "rgba(255,255,255,0)",
            pointHoverBackgroundColor: "#5f4eff",
            //pointHoverBorderColor:'rgba(35,46,55,1)',
            pointBorderWidth: 20,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 15,
            pointRadius: 3,
            data: adminData.income.year.data,
          },
        ],
      },
      options: {
        // maintainAspectRatio: false,
        legend: {
          display: false,
        },

        tooltips: {
          backgroundColor: "#13131366",
          borderColor: "#fff",
          titleFontColor: "#fff",
          bodyFontColor: "#fff",
          bodySpacing: 4,
          xPadding: 22,
          yPadding: 10,
          mode: "nearest",
          intersect: 0,
          position: "nearest",
        },
        responsive: true,
        scales: {
          yAxes: [
            {
              barPercentage: 1.6,
              gridLines: {
                drawBorder: false,
                color: "rgba(0,0,0,0.0)",
                zeroLineColor: "transparent",
              },
              ticks: {
                display: false,
                suggestedMin: 0,
                suggestedMax: 350,
                padding: 20,
                fontColor: "#9aa9a",
              },
            },
          ],

          xAxes: [
            {
              barPercentage: 1.6,
              gridLines: {
                drawBorder: false,
                color: "rgba(0,0,0,0)",
                zeroLineColor: "transparent",
              },
              ticks: {
                padding: 20,
                fontColor: "#131313",
              },
            },
          ],
        },
      },
    });

    setMainChart(myChart);
  };

  const OneOrder = ({ order }) => {
    return (
      <Link
        to={`/orders/${order.id}`}
        className="cursor-pointer items-center py-3 px-1 hover:bg-slate-100 w-full grid scale-95  "
        style={{ gridTemplateColumns: "30% 50% 20%" }}
      >
        <span className="text-base truncate">{order.user.name}</span>

        <span className="mx-2 font-light text-sm text-slate-600 truncate">
          {order.items.map((item) => `${item.name}, `)}
        </span>
        <span className="mx-2 text-base truncate text-center">
          ${order.price}
        </span>
      </Link>
    );
  };

  return (
    <main className="flex w-full flex-col items-center mt-20 px-4 sm:px-8">
      <HeaderSection />
      <div className="container grid grid-cols-1 container my-8 items-center max-w-[90rem] justify-center">
        <div className="flex h-full justify-between">
          <h1 className="my-2 text-2xl">Income Chart</h1>
          <div className="flex h-min">
            <button
              onClick={() => updateChart(adminData.income.weak)}
              className="py-1 px-2 rounded-bl-lg rounded-tl-lg bg-indigo-200 text-indigo-600 hover:bg-indigo-700 hover:text-white active:scale-95 transition-all"
            >
              W<span className="none sm:inline">eak</span>
            </button>
            <button
              onClick={() => updateChart(adminData.income.month)}
              className="py-React.createContext()1 px-2 bg-indigo-200 text-indigo-600 hover:bg-indigo-700 hover:text-white active:scale-95 transition-all"
            >
              M<span className="none sm:inline">onth</span>
            </button>
            <button
              onClick={() => updateChart(adminData.income.year)}
              className="py-1 px-2 rounded-br-lg rounded-tr-lg bg-indigo-200 text-indigo-600 hover:bg-indigo-700 hover:text-white active:scale-95 transition-all"
            >
              Y<span className="none sm:inline">ear</span>
            </button>
          </div>
        </div>
        <div>
          <canvas id="mainCanvas"></canvas>
        </div>
      </div>
      <div className="container grid grid-cols-1 max-w-[90rem]">
        <div className="container flex flex-col my-4 xl:ml-3">
          <div className="flex justify-between text-xl items-center">
            <h1 className="text-xl font-semibold">
              Orders
              <small className="text-slate-500 font-normal">
                ({adminData.orders.length})
              </small>
            </h1>
          </div>
          <div className="overflow-x-hidden overlfow-y-auto h-[50vh]">
            {adminData.orders.map((order) => (
              <OneOrder order={order} key={order.id} />
            ))}
          </div>
        </div>
      </div>
      <div className="container grid grid-cols-1 xl:grid-cols-2 max-w-[90rem]">
        <div className="container flex flex-col my-4 xl:mr-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">
              Users
              <small className="text-slate-500 font-normal">
                ({adminData.users.length})
              </small>
            </h1>
          </div>
          <div className="overflow-x-hidden overlfow-y-auto h-[50vh]">
            {adminData.users.map((user) => (
              <User user={user} key={user.id} />
            ))}
          </div>
        </div>

        <div className="container flex flex-col my-4 xl:ml-3">
          <div className="flex justify-between text-xl items-center">
            <h1 className="text-xl font-semibold">
              List of feedbacks
              <small className="text-slate-500 font-normal">
                ({adminData.feedbacks.length})
              </small>
            </h1>
          </div>
          <div className="overflow-x-hidden overlfow-y-auto h-[50vh]">
            {adminData.feedbacks.map((feedback) => (
              <Feedback feedback={feedback} key={feedback.id} />
            ))}
          </div>
        </div>
      </div>
      <div className="container flex flex-col my-4 max-w-[90rem]">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            List of Foods
            <small className="text-slate-500 font-normal">
              ({adminData.foods.length})
            </small>
          </h1>
          <Link
            to="/foods/create/new"
            className="text-indigo-700 font-normal p-2"
          >
            Add new
          </Link>
        </div>
        <div className="listOfFood grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 overflow-x-hidden overlfow-y-auto h-[75vh]">
          {adminData.foods.map((food) => (
            <Card food={food} key={food.id} />
          ))}
        </div>
      </div>
      {/* <div className="container grid grid-cols-1 xl:grid-cols-2 max-w-[90rem]">

        <div className="container flex flex-col my-4 xl:mr-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">
              Top 10
              <small className="text-slate-500 font-normal">(users)</small>
            </h1>
          </div>
          <div className="overflow-x-hidden overlfow-y-auto h-[30vh]">
            {adminData.top10.users &&
              adminData.top10.users.map((user) => (
                <a
                  className="hover:bg-slate-100 w-full flex items-center scale-95  "
                  href={`accounts/${user.id}`}
                >
                  <img
                    src={user.profile}
                    alt={`${user.name}'s profile image`}
                    className="overflow-hidden rounded-[33%] min-w-[3rem] w-[15%] m-2 aspect-square sm:w-[2.5rem] sm:min-w-[2.5rem] sm:h-[2.5rem]"
                  />
                  <div className="m-1 w-full overflow-hidden truncate">
                    <span className="text-base">{user.name}</span>
                    <br />
                    <span className="font-light text-sm text-slate-600">
                      {user.phone}
                    </span>
                  </div>
                  <span className="p-3">${user.totalBuy}</span>
                </a>
              ))}
          </div>
        </div>

        <div className="container flex flex-col my-4 xl:ml-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">
              Top 10
              <small className="text-slate-500 font-normal">(foods)</small>
            </h1>
          </div>
          <div className="overflow-x-hidden overflow-y-auto h-[30vh]">
            {adminData.top10.foods &&
              adminData.top10.foods.map((food) => (
                <div
                  className="grid py-3 px-1 scale-95  "
                  style={{ gridTemplateColumns: "10% 40% 25% 25%" }}
                >
                  <span className="">01</span>
                  <span className="truncate underline">
                    <a href="buy.html">{food.name}</a>
                  </span>
                  <span className="">x{food.count}</span>
                  <span className="">${food.totalprice}</span>
                </div>
              ))}
          </div>
        </div>
        
      </div> */}
      <FooterSection />
      <div
        className={`${
          !avFeedback.id ? "pointer-events-none opacity-0" : ""
        } bg-[#00000080] flex items-center justify-center w-full h-full z-[1000] fixed top-0 left-0`}
      >
        <div
          className={`min-w-[250px] mx-4 flex flex-col bg-[#ffffffbf] backdrop-blur-md rounded-xl max-w-[40rem]  shadow-xl ${
            !avFeedback.id ? "opacity-0 scale-95" : ""
          }`}
        >
          <p className="m-4 min-w-[250px]">
            <Link to={`/profile/${avFeedback.user__phone}`} className="font-medium underline mr-4">
              {avFeedback.user__name}
            </Link>
            {avFeedback.text}
          </p>
          <div className="flex">
            <button
              onClick={markFeedbackAsRead}
              className="p-3 w-full border-t-[1px] border-gray-300"
            >
              Ok
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

const ManageFoods = () => {
  const [messages, setMessages] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [oked, setOked] = useState(false);
  const [tempImage, setTempImage] = useState("");
  const [addNewCategory, setAddNewCategory] = useState(false);
  const [data, setData] = useContext(Context).data;
  const [adminData, setAdminData] = useContext(Context).adminData;
  const [categories, setCategories] = useState(adminData.categories);
  const [formData, setFormData] = useState({});
  const [action, setAction] = useState("");
  const url = useParams();

  useEffect(() => {
    try {
      let food = data.foods
        .map((g) => g.foods.filter((p) => p.id == url.id))
        .filter((arr) => arr.length)[0][0];
      setFormData(food);
      setAction(`/api/foods/update/${url.id}`);
    } catch (ReferenceError) {
      setFormData({});
      setAction("/api/foods/create");
    }
  }, [1]);

  const manageData = (e) => {
    setMessages({});
    setIsLoading(false);

    if (e.target.name == "image") {
      const [file] = e.target.files;
      setTempImage(URL.createObjectURL(file));
      setFormData({ ...formData, [e.target.name]: file });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const hanldeSubmit = (e) => {
    e.preventDefault();
    if (!oked) {
      setMessages({});
      setIsLoading(true);
      const thisForm = new FormData();
      thisForm.append("name", formData.name || "");
      thisForm.append("about", formData.about || "");
      thisForm.append("slug", formData.slug || "");
      thisForm.append("image", formData.image || "");
      thisForm.append("cal", formData.cal || "");
      thisForm.append("price", formData.price || "");
      thisForm.append("category", formData.category || "");
      thisForm.append("csrfmiddlewaretoken", data.csrfmiddlewaretoken);
      console.log(thisForm);
      $.ajax({
        method: "POST",
        url: action,
        data: thisForm,
        contentType: false,
        processData: false,
        success: (r) => {
          setIsLoading(false);
          if (r.result === "ok") {
            setOked(true);
            setAdminData({ ...adminData, ["foods"]: r.foods });
          } else {
            setMessages(r);
          }
        },
      });
    }
  };
  const addCategory = (e) => {
    e.preventDefault();
    setMessages({});
    $.ajax({
      method: "POST",
      url: "/api/category/new",
      data: {
        csrfmiddlewaretoken: data.csrfmiddlewaretoken,
        name: formData.newcategory || "",
      },
      success: (r) => {
        console.log(r);
        setAdminData({ ...adminData, ["categories"]: r.categories });
        setCategories(r.categories);

        if (r.result == "ok") {
          setAddNewCategory(false);
          setMessages({});
        } else {
          setMessages(r);
        }
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
        <div className="min-w-full rounded-xl w-full aspect-video sm:min-w-fit sm:max-w-fit flex items-center justify-center overflow-hidden relative group">
          <input
            onChange={manageData}
            type="file"
            name="image"
            className="w-full h-full  z-[1] absolute cursor-pointer opacity-0"
            title={formData.id ? "Change image" : "Set image"}
          />
          <img
            src={tempImage || formData.image}
            alt={`${formData.name || "Food"}'s image`}
            className="h-full group-hover:brightness-75 w-full"
          />
          <div className="absolute w-20 h-20 rounded-full flex items-center justify-center bg-[#0000001a]">
            <i className="bi bi-pencil absolute text-white"></i>
          </div>
        </div>

        <span
          className={`ml-2 text-sm text-red-500 pb-3 pt-1 ${
            messages.image ? "opacity-100" : ""
          }`}
        >
          {messages.image || ""}
        </span>

        <div className="flex justify-between flex-col w-full">
          <div className="w-full my-1 text-lg flex flex-col">
            <input
              className="w-full bg-gray-100 p-3 rounded-lg placeholder:text-gray-600"
              type="text"
              maxLength="50"
              name="name"
              placeholder="name"
              onChange={manageData}
              defaultValue={formData.name}
            />
            <span
              className={`ml-2 text-sm text-red-500 pt-1 ${
                messages.name && !addNewCategory ? "opacity-100" : ""
              }`}
            >
              {messages.name || ""}
            </span>
          </div>

          <div className="w-full my-1 text-lg flex flex-col">
            <textarea
              cols="30"
              rows="5"
              className="resize-none w-full no-scroll p-3 rounded-lg bg-gray-100"
              maxLength="250"
              placeholder="About..."
              name="about"
              onChange={manageData}
              defaultValue={formData.about || ""}
            ></textarea>
            <span
              className={`ml-2 text-sm text-red-500 pt-1 ${
                messages.about ? "opacity-100" : ""
              }`}
            >
              {messages.about || ""}
            </span>
          </div>

          <div className="w-full my-1 text-lg flex flex-col">
            <input
              className="w-full bg-gray-100 p-3 rounded-lg placeholder:text-gray-600"
              type="text"
              maxLength="50"
              name="slug"
              onChange={manageData}
              placeholder="slug-for-food"
              defaultValue={formData.slug || ""}
            />
            <span
              className={`ml-2 text-sm text-red-500 pt-1 ${
                messages.slug ? "opacity-100" : ""
              }`}
            >
              {messages.slug || ""}
            </span>
          </div>

          <div className="grid grid-cols-2 justify-between items-center mt-1 mb-3 w-full text-lg">
            <div className="w-full pr-2 my-1 text-lg flex flex-col">
              <span className="text-gray-800 p-3 bg-gray-100 rounded-xl flex">
                🔥
                <input
                  className="w-full bg-gray-100 ml-1"
                  type="number"
                  min="0"
                  max="9999999"
                  maxLength="7"
                  onChange={manageData}
                  name="cal"
                  placeholder="Energy..."
                  defaultValue={formData.cal || ""}
                />
                cal
              </span>
              <span
                className={`ml-2 text-sm text-red-500 pt-1 ${
                  messages.cal ? "opacity-100" : ""
                }`}
              >
                {messages.cal || ""}
              </span>
            </div>

            <div className="w-full pl-2 my-1 text-lg flex flex-col">
              <span className="text-gray-800 p-3 bg-gray-100 rounded-xl flex">
                $
                <input
                  type="number"
                  placeholder="9.99"
                  onChange={manageData}
                  name="price"
                  min="0"
                  className="w-full bg-gray-100 ml-1"
                  defaultValue={formData.price || ""}
                />
              </span>
              <span
                className={`ml-2 text-sm text-red-500 pt-1 ${
                  messages.price ? "opacity-100" : ""
                }`}
              >
                {messages.price || ""}
              </span>
            </div>
          </div>

          <div className="w-full my-1 text-lg">
            {categories.map((category) => (
              <button
                key={category.id}
                type="reset"
                name="category"
                onClick={manageData}
                value={`${category.id}`}
                className={`rounded-full py-1 px-3 m-1 bg-gradient-to-tr ${
                  category.id == formData.category
                    ? "from-indigo-600 to-indigo-700 text-white"
                    : "border-[1px] border-gray-200"
                } `}
              >
                {category.name}
              </button>
            ))}
            <button
              className="m-1"
              type="reset"
              onClick={() => {
                setAddNewCategory(true);
                setMessages({});
              }}
            >
              <i className="bi bi-plus flex p-1 border-2 border-gray-900 rounded-full"></i>
            </button>
          </div>

          <span
            className={`ml-2 text-sm text-red-500 pb-3 pt-1 ${
              messages.category ? "opacity-100" : ""
            }`}
          >
            {messages.category || ""}
          </span>

          <button
            type="submit"
            className={`flex items-center justify-center w-full m-0 rounded-xl text-white active:scale-95 transition-all ${
              oked ? "bg-gray-900" : "bg-indigo-700"
            }`}
          >
            {isLoading ? (
              <Loading classNamees={"text-[3px] m-3"} />
            ) : oked ? (
              <Link to="/admin-panel" className="py-4 px-8 block">
                Back to admin panel
              </Link>
            ) : (
              <span className="py-4 px-8 block">
                {url.id ? "Submit Chages" : "Create"}
              </span>
            )}
          </button>
        </div>
      </form>
      <FooterSection />

      <div
        className={`${
          !addNewCategory ? "pointer-events-none opacity-0" : ""
        } bg-[#00000080] flex items-center justify-center w-full h-full z-[1000] fixed top-0 left-0`}
      >
        <form
          onSubmit={addCategory}
          className={`min-w-[250px] mx-4 flex flex-col bg-[#ffffffbf] backdrop-blur-md rounded-xl max-w-[40rem]  shadow-xl ${
            !addNewCategory ? "opacity-0 scale-95" : ""
          }`}
        >
          <input
            placeholder="Category name..."
            maxLength="50"
            onChange={manageData}
            name="newcategory"
            className="overflow-hidden m-4 focus:border-0 focus:outline-0 min-w-[250px]  bg-transparent"
          />
          <span
            className={`ml-2 text-sm text-red-500 pb-3 pt-1 ${
              messages.name ? "opacity-100" : ""
            }`}
          >
            {messages.name || ""}
          </span>
          <div className="flex">
            <button
              type="reset"
              onClick={() => {
                setAddNewCategory(false);
                setMessages({});
              }}
              className="p-3 w-full border-t-[1px] border-r-[1px] border-gray-300 text-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="p-3 w-full border-t-[1px] border-gray-300"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

const OrderPage = ({}) => {
  const [adminData, setAdminData] = useContext(Context).adminData;
  const [data, setData] = useContext(Context).data;
  const [completed, setCompleted] = useState(false);
  const [order, setOrder] = useState({});
  const url = useParams();

  useEffect(() => {
    const thisOrder = adminData.orders.filter((o) => o.id == url.id)[0];
    setOrder(thisOrder);
  }, [1]);

  const handleCompletCard = () => {
    $.ajax({
      method: "POST",
      url: "/api/cart/deliver",
      data: {
        csrfmiddlewaretoken: data.csrfmiddlewaretoken,
        id: order.id,
      },
      success: (r) => {
        console.log(r);
        if (r.result == "ok") {
          setAdminData({ ...adminData, ["orders"]: r.orders });
          setCompleted(true);
        }
      },
    });
  };

  return (
    <main className="flex w-full flex-col items-center mt-20">
      <HeaderSection />
      <div className="container grid grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col m-4 lg:mr-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">
              Items list
              <small className="text-slate-500 font-normal">
                ({order.items && order.items.length})
              </small>
            </h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2  2xl:grid-cols-3 overflow-x-hidden overlfow-y-auto h-[75vh]">
            {order.items &&
              order.items.map((item) => (
                <div className="relative p-2 bg-white shadow-lg flex-col overflow-hidden rounded-xl m-2 card flex h-min">
                  <div className="flex w-full aspect-video items-center justify-center rounded-xl overflow-hidden">
                    <img
                      src={item.image}
                      alt={`${item.name}'s image`}
                      className="h-full"
                    />
                  </div>
                  <div className="flex flex-col h-full justify-between">
                    <Link to={item.url} className="my-1 font-medium underline truncate">
                      {item.name}
                    </Link>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-800 mr-1 py-1">
                        x {item.quantity}
                      </span>

                      <span className="font-meduim">${item.price}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="flex flex-col m-4 lg:ml-4 justify-between">
          <Link
            to={`/profile/${order.user && order.user.phone}`}
            className="w-full flex items-center m-2 mb-6 flex-col justify-center"
          >
            <img
              src={order.user && order.user.profile}
              alt={`${order.user && order.user.name} profile image`}
              className="overflow-hidden rounded-[33%]  aspect-square w-[7.5rem] min-w-[7.5rem] h-[7.5rem]"
            />
            <div className="overflow-hidden truncate text-center">
              <h1 className="font-medium text-3xl m-3">
                {order.user && order.user.name}
              </h1>
              <span className="font-light text-base text-slate-600">
                {order.user &&
                  `${order.user.phone}${" | " + order.user.email || ""}`}
              </span>
            </div>
          </Link>

          <div className="flex flex-col w-full">
            <div className="my-2 text-xl flex">
              <span className="text-semibold">Address: </span>
              <span className="text-slate-800 text-lg ml-2 w-full">
                {order.address}
              </span>
            </div>
            <div className="flex justify-between items-start my-4 w-full text-xl">
              <span>Total Price:</span>
              <span className="text-gray-800">${order.price}</span>
            </div>
            <button
              className={`w-full mt-10 rounded-x text-white active:scale-95 transition-all rounded-2xl ${
                completed ? "bg-gray-900" : "bg-indigo-700"
              }`}
            >
              {completed ? (
                <Link to="/admin-panel" className="py-4 px-8 block">
                  Back to admin
                </Link>
              ) : (
                <span className="py-4 px-8 block" onClick={handleCompletCard}>
                  Deliver
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      <FooterSection />
    </main>
    // <span>{url.id}</span>
  );
};
